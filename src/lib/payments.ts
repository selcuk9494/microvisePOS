import { getDb } from "@/lib/database";
import {
  isIngenicoBridgeEnabled,
  runBridgeCancel,
  runBridgePairing,
  runBridgePayment,
  runBridgePrecheck,
} from "@/lib/ingenico-bridge";
import type { PaymentTerminal } from "@/lib/pos-data";
import { readStore, updateOrderById } from "@/lib/store";
import type {
  PaymentMethod,
  PaymentStatus,
  PaymentTransaction,
  TerminalPairingResult,
  TerminalPrecheckResult,
} from "@/lib/payment-types";

const ingenicoRetcodes: Record<string, string> = {
  "2309": "Gecersiz sira numarasi",
  "2329": "Eslesme yapilmasi gerekli",
  "2334": "Yanlis cihaz",
  "2341": "Handle bulunamadi",
  "2449": "Gecersiz essiz numara",
};
const PairingCooldownMs = 90_000;
const lastSuccessfulPairingByTerminal = new Map<string, number>();

function sanitizeText(value: string) {
  return value.trim();
}

function mapTerminal(row: {
  id: string;
  name: string;
  brand: string;
  model: string;
  connection_mode: "serial" | "ethernet";
  interface_id: string;
  ip_address: string;
  port: number;
  port_name: string;
  baud_rate: number;
  enabled: number;
  use_mock: number;
  default_timeout_ms: number;
  card_timeout_ms: number;
  serial_number: string;
  ecr_serial_number: string;
  external_device_brand: string;
  external_device_model: string;
  notes: string;
}) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    model: row.model,
    connectionMode: row.connection_mode,
    interfaceId: row.interface_id,
    ipAddress: row.ip_address,
    port: row.port,
    portName: row.port_name,
    baudRate: row.baud_rate,
    enabled: Boolean(row.enabled),
    useMock: Boolean(row.use_mock),
    defaultTimeoutMs: row.default_timeout_ms,
    cardTimeoutMs: row.card_timeout_ms,
    serialNumber: row.serial_number,
    ecrSerialNumber: row.ecr_serial_number,
    externalDeviceBrand: row.external_device_brand,
    externalDeviceModel: row.external_device_model,
    notes: row.notes,
  } satisfies PaymentTerminal;
}

function mapPayment(row: {
  id: string;
  order_id: string;
  terminal_id: string;
  amount: number;
  currency_code: number;
  status: PaymentStatus;
  method: PaymentMethod;
  payment_name: string;
  payment_info: string;
  approval_code: string;
  reference_number: string;
  masked_pan: string;
  batch_number: string;
  error_code: string;
  error_message: string;
  request_payload: string;
  response_payload: string;
  created_at: string;
  completed_at: string;
}) {
  return {
    id: row.id,
    orderId: row.order_id,
    terminalId: row.terminal_id,
    amount: row.amount,
    currencyCode: row.currency_code,
    status: row.status,
    method: row.method,
    paymentName: row.payment_name,
    paymentInfo: row.payment_info,
    approvalCode: row.approval_code,
    referenceNumber: row.reference_number,
    maskedPan: row.masked_pan,
    batchNumber: row.batch_number,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    requestPayload: row.request_payload,
    responsePayload: row.response_payload,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  } satisfies PaymentTransaction;
}

function createConnectionSummary(terminal: PaymentTerminal) {
  if (terminal.connectionMode === "ethernet") {
    return `TCP ${terminal.ipAddress}:${terminal.port} / ${terminal.portName}`;
  }

  return `SERIAL ${terminal.portName} @ ${terminal.baudRate}`;
}

function createRequestPayload(
  terminal: PaymentTerminal,
  amount: number,
  paymentName: string,
  paymentInfo: string,
  method: PaymentMethod,
  items: Array<{ id: number; name: string; qty: number; price: number; note?: string }>,
) {
  return {
    interface: {
      RetryCounter: 1,
      IpRetryCount: 1,
      AckTimeOut: 300,
      CommTimeOut: terminal.defaultTimeoutMs,
      InterCharacterTimeOut: 100,
      PortName: terminal.portName,
      BaudRate: terminal.baudRate,
      IsTcpConnection: terminal.connectionMode === "ethernet" ? 1 : 0,
      IP: terminal.ipAddress,
      Port: terminal.port,
      IsTcpKeepAlive: terminal.connectionMode === "ethernet" ? 1 : 0,
    },
    pairing: {
      szProcOrderNumber: "000001",
      szExternalDeviceBrand: terminal.externalDeviceBrand,
      szExternalDeviceModel: terminal.externalDeviceModel,
      szExternalDeviceSerialNumber: terminal.serialNumber,
      szEcrSerialNumber: terminal.ecrSerialNumber,
    },
    items,
    payment: {
      method,
      typeOfPayment: method === "nakit" ? 1 : 4,
      subtypeOfPayment: method === "nakit" ? 0 : 1,
      payAmount: amount,
      payAmountCurrencyCode: 949,
      numberOfinstallments: 0,
      paymentName,
      paymentInfo,
    },
  };
}

function createTerminalId() {
  return `TERM-${String(Date.now()).slice(-6)}`;
}

function buildTerminalPayload(input: Partial<PaymentTerminal> & { name: string }) {
  const name = sanitizeText(input.name);

  if (!name) {
    throw new Error("Terminal adi zorunludur.");
  }

  const connectionMode = input.connectionMode ?? "ethernet";
  const ipAddress = typeof input.ipAddress === "string" ? sanitizeText(input.ipAddress) : "";
  const port = typeof input.port === "number" ? input.port : 7500;
  const portName = typeof input.portName === "string" ? sanitizeText(input.portName) : "";
  const baudRate = typeof input.baudRate === "number" ? input.baudRate : 115200;

  if (connectionMode === "ethernet" && (!ipAddress || !port)) {
    throw new Error("Ethernet terminal icin IP ve port zorunludur.");
  }

  if (connectionMode === "serial" && !portName) {
    throw new Error("Serial terminal icin COM port zorunludur.");
  }

  return {
    id: input.id?.trim() || createTerminalId(),
    name,
    brand: sanitizeText(input.brand ?? "Ingenico"),
    model: sanitizeText(input.model ?? "Move5000F"),
    connectionMode,
    interfaceId: sanitizeText(input.interfaceId ?? "COM1"),
    ipAddress,
    port,
    portName,
    baudRate,
    enabled: Number(typeof input.enabled === "boolean" ? input.enabled : true),
    useMock: Number(typeof input.useMock === "boolean" ? input.useMock : true),
    defaultTimeoutMs: typeof input.defaultTimeoutMs === "number" ? input.defaultTimeoutMs : 10000,
    cardTimeoutMs: typeof input.cardTimeoutMs === "number" ? input.cardTimeoutMs : 60000,
    serialNumber: sanitizeText(input.serialNumber ?? ""),
    ecrSerialNumber: sanitizeText(input.ecrSerialNumber ?? ""),
    externalDeviceBrand: sanitizeText(input.externalDeviceBrand ?? "WORLDLINE"),
    externalDeviceModel: sanitizeText(input.externalDeviceModel ?? "IWE280"),
    notes: sanitizeText(input.notes ?? ""),
  };
}

function shouldUseMock(terminal: PaymentTerminal) {
  return terminal.useMock;
}

function canUseBridge(terminal: PaymentTerminal) {
  return !shouldUseMock(terminal) && isIngenicoBridgeEnabled();
}

async function appendPaymentLog(paymentId: string, level: "info" | "error", message: string, detail = "") {
  const db = getDb();
  db.prepare(
    `
      INSERT INTO payment_logs (payment_id, level, message, detail, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
  ).run(paymentId, level, message, detail, new Date().toISOString());
}

export async function listPaymentTerminals() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, name, brand, model, connection_mode, interface_id, ip_address, port, port_name, baud_rate,
               enabled, use_mock, default_timeout_ms, card_timeout_ms, serial_number, ecr_serial_number,
               external_device_brand, external_device_model, notes
        FROM payment_terminals
        ORDER BY enabled DESC, name ASC
      `,
    )
    .all() as Array<{
      id: string;
      name: string;
      brand: string;
      model: string;
      connection_mode: "serial" | "ethernet";
      interface_id: string;
      ip_address: string;
      port: number;
      port_name: string;
      baud_rate: number;
      enabled: number;
      use_mock: number;
      default_timeout_ms: number;
      card_timeout_ms: number;
      serial_number: string;
      ecr_serial_number: string;
      external_device_brand: string;
      external_device_model: string;
      notes: string;
    }>;

  return rows.map(mapTerminal);
}

export async function getPaymentTerminal(id?: string) {
  const terminals = await listPaymentTerminals();
  if (id) {
    return terminals.find((terminal) => terminal.id === id) ?? null;
  }

  return terminals.find((terminal) => terminal.enabled) ?? terminals[0] ?? null;
}

export async function createPaymentTerminal(input: Partial<PaymentTerminal> & { name: string }) {
  const db = getDb();
  const payload = buildTerminalPayload(input);

  db.prepare(
    `
      INSERT INTO payment_terminals (
        id, name, brand, model, connection_mode, interface_id, ip_address, port, port_name, baud_rate,
        enabled, use_mock, default_timeout_ms, card_timeout_ms, serial_number, ecr_serial_number,
        external_device_brand, external_device_model, notes
      )
      VALUES (
        @id, @name, @brand, @model, @connectionMode, @interfaceId, @ipAddress, @port, @portName, @baudRate,
        @enabled, @useMock, @defaultTimeoutMs, @cardTimeoutMs, @serialNumber, @ecrSerialNumber,
        @externalDeviceBrand, @externalDeviceModel, @notes
      )
    `,
  ).run(payload);

  return getPaymentTerminal(payload.id);
}

export async function updatePaymentTerminal(id: string, input: Partial<PaymentTerminal>) {
  const db = getDb();
  const current = await getPaymentTerminal(id);

  if (!current) {
    throw new Error("Terminal bulunamadi.");
  }

  const payload = buildTerminalPayload({
    ...current,
    ...input,
    id,
    name: typeof input.name === "string" ? input.name : current.name,
  });

  db.prepare(
    `
      UPDATE payment_terminals
      SET name = @name,
          brand = @brand,
          model = @model,
          connection_mode = @connectionMode,
          interface_id = @interfaceId,
          ip_address = @ipAddress,
          port = @port,
          port_name = @portName,
          baud_rate = @baudRate,
          enabled = @enabled,
          use_mock = @useMock,
          default_timeout_ms = @defaultTimeoutMs,
          card_timeout_ms = @cardTimeoutMs,
          serial_number = @serialNumber,
          ecr_serial_number = @ecrSerialNumber,
          external_device_brand = @externalDeviceBrand,
          external_device_model = @externalDeviceModel,
          notes = @notes
      WHERE id = @id
    `,
  ).run({
    ...payload,
  });

  return getPaymentTerminal(id);
}

export async function deletePaymentTerminal(id: string) {
  const db = getDb();
  const current = await getPaymentTerminal(id);

  if (!current) {
    throw new Error("Terminal bulunamadi.");
  }

  db.prepare("DELETE FROM payment_terminals WHERE id = ?").run(id);
}

export async function runIngenicoPrecheck(terminalId?: string): Promise<TerminalPrecheckResult> {
  const terminal = await getPaymentTerminal(terminalId);

  if (!terminal || !terminal.enabled) {
    return {
      ready: false,
      pairingRequired: false,
      connectionSummary: "-",
      message: "Etkin terminal bulunamadi.",
      logs: ["Terminal secilmedi veya pasif."],
    };
  }

  const logs = [
    `Baglanti ayari => ${createConnectionSummary(terminal)}`,
    `InterfaceId=${terminal.interfaceId}`,
    "Json_FP3_UpdateInterfaceXmlDataByID icin runtime JSON hazirlandi.",
    "Json_FP3_Echo ve FP3_IsGmpPairingDone akislari belgelerden modellendi.",
  ];

  if (terminal.connectionMode === "ethernet" && (!terminal.ipAddress || !terminal.port)) {
    return {
      ready: false,
      pairingRequired: true,
      connectionSummary: createConnectionSummary(terminal),
      message: "Ethernet terminali icin IP ve port zorunludur.",
      logs,
    };
  }

  if (terminal.connectionMode === "serial" && !terminal.portName) {
    return {
      ready: false,
      pairingRequired: true,
      connectionSummary: createConnectionSummary(terminal),
      message: "Serial terminal icin COM port zorunludur.",
      logs,
    };
  }

  if (canUseBridge(terminal)) {
    try {
      const result = await runBridgePrecheck(terminal);
      return {
        ...result,
        logs: [...logs, ...result.logs],
      };
    } catch (error) {
      return {
        ready: false,
        pairingRequired: true,
        connectionSummary: createConnectionSummary(terminal),
        message: error instanceof Error ? error.message : "Ingenico bridge precheck basarisiz.",
        logs: [...logs, "Remote bridge ile precheck denemesi basarisiz oldu."],
      };
    }
  }

  if (shouldUseMock(terminal)) {
    return {
      ready: true,
      pairingRequired: false,
      connectionSummary: createConnectionSummary(terminal),
      message: "Mock modunda terminal odeme icin hazir.",
      logs,
    };
  }

  return {
    ready: true,
    pairingRequired: false,
    connectionSummary: createConnectionSummary(terminal),
    message:
      process.platform === "win32"
        ? "Windows bridge URL tanimli degil. Local bridge servisini acin veya INGENICO_BRIDGE_URL ayarlayin."
        : "Bu cihaz Windows degil. Gercek cihaz icin remote bridge servisi tanimlanmali.",
    logs: [...logs, "Bridge URL bulunamadi, terminal pending modda tutuldu."],
  };
}

export async function startIngenicoPairing(terminalId?: string): Promise<TerminalPairingResult> {
  const terminal = await getPaymentTerminal(terminalId);

  if (!terminal) {
    return {
      ok: false,
      message: "Terminal bulunamadi.",
      responseSummary: "",
      logs: [],
    };
  }

  const logs = [
    `Json_FP3_StartPairingInit request hazirlandi: ${terminal.externalDeviceBrand}/${terminal.externalDeviceModel}`,
    "Warm-up adimlari planlandi: Json_FP3_GetTaxRates_Ex, Json_FP3_GetDepartments_Ex, Json_FP3_GetCurrencyProfile",
    `Baglanti: ${createConnectionSummary(terminal)}`,
  ];
  const cacheKey = terminal.id;
  const lastSuccessAt = lastSuccessfulPairingByTerminal.get(cacheKey) ?? 0;
  const now = Date.now();

  if (lastSuccessAt > 0 && now - lastSuccessAt < PairingCooldownMs) {
    const secondsLeft = Math.ceil((PairingCooldownMs - (now - lastSuccessAt)) / 1000);
    return {
      ok: true,
      message: `Pairing tekrarina gerek yok. Son basarili eslesme yeni yapildi (${secondsLeft}s).`,
      responseSummary: `${terminal.brand} ${terminal.model} / cached`,
      logs: [...logs, "Pairing cooldown aktif, bridge cagrisi atlandi."],
    };
  }

  if (canUseBridge(terminal)) {
    try {
      const result = await runBridgePairing(terminal);
      if (result.ok) {
        lastSuccessfulPairingByTerminal.set(cacheKey, now);
      }
      return {
        ...result,
        logs: [...logs, ...result.logs],
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Ingenico pairing basarisiz.",
        responseSummary: `${terminal.brand} ${terminal.model} / remote bridge hata`,
        logs,
      };
    }
  }

  return {
    ok: true,
    message: shouldUseMock(terminal)
      ? "Pairing simulasyonu tamamlandi."
      : "Bridge servisi tanimlandiginda pairing komutu gercek cihaza gonderilecek.",
    responseSummary: `${terminal.brand} ${terminal.model} / retcode 0`,
    logs,
  };
}

export async function startPayment(input: {
  orderId: string;
  amount: number;
  terminalId?: string;
  method: PaymentMethod;
  paymentName: string;
  paymentInfo: string;
}) {
  const terminal = await getPaymentTerminal(input.terminalId);

  if (!terminal) {
    throw new Error("Odeme icin etkin terminal bulunamadi.");
  }

  const store = await readStore();
  const order = store.orders.find((item) => item.id === input.orderId);

  if (!order) {
    throw new Error("Odeme alinacak adisyon bulunamadi.");
  }

  const paymentItems = [...order.items];

  const db = getDb();
  const paymentId = `PAY-${Date.now()}`;
  const requestPayload = JSON.stringify(
    createRequestPayload(terminal, input.amount, input.paymentName, input.paymentInfo, input.method, paymentItems),
  );
  const now = new Date().toISOString();

  db.prepare(
    `
      INSERT INTO payment_transactions (
        id, order_id, terminal_id, amount, currency_code, status, method, payment_name, payment_info,
        approval_code, reference_number, masked_pan, batch_number, error_code, error_message,
        request_payload, response_payload, created_at, completed_at
      )
      VALUES (
        @id, @orderId, @terminalId, @amount, 949, 'pending', @method, @paymentName, @paymentInfo,
        '', '', '', '', '', '', @requestPayload, '{}', @createdAt, ''
      )
    `,
  ).run({
    id: paymentId,
    orderId: input.orderId,
    terminalId: terminal.id,
    amount: input.amount,
    method: input.method,
    paymentName: input.paymentName,
    paymentInfo: input.paymentInfo,
    requestPayload,
    createdAt: now,
  });

  await appendPaymentLog(paymentId, "info", "Odeme istegi olusturuldu.", requestPayload);

  if (shouldUseMock(terminal)) {
    const responsePayload = JSON.stringify({
      ErrorCode: 0,
      approvalCode: "A12456",
      referenceNumber: `RRN${String(Date.now()).slice(-6)}`,
      maskedPan: "5549********1122",
      batchNumber: "B-204",
      paymentStatus: "approved",
    });

    db.prepare(
      `
        UPDATE payment_transactions
        SET status = 'approved',
            approval_code = @approvalCode,
            reference_number = @referenceNumber,
            masked_pan = @maskedPan,
            batch_number = @batchNumber,
            response_payload = @responsePayload,
            completed_at = @completedAt
        WHERE id = @id
      `,
    ).run({
      id: paymentId,
      approvalCode: "A12456",
      referenceNumber: `RRN${String(Date.now()).slice(-6)}`,
      maskedPan: "5549********1122",
      batchNumber: "B-204",
      responsePayload,
      completedAt: new Date().toISOString(),
    });

    await appendPaymentLog(paymentId, "info", "Mock Ingenico odemesi onaylandi.", responsePayload);
    await updateOrderById(input.orderId, {
      status: "odendi",
      payment: input.method,
    });
  } else if (canUseBridge(terminal)) {
    try {
      const bridgeResult = await runBridgePayment(terminal, {
        paymentId,
        orderId: input.orderId,
        amount: input.amount,
        method: input.method,
        items: paymentItems,
        paymentName: input.paymentName,
        paymentInfo: input.paymentInfo,
        requestPayload: {
          ...JSON.parse(requestPayload),
          method: input.method,
          items: paymentItems,
        },
      });
      const nextStatus: PaymentStatus = bridgeResult.status;
      const responsePayloadText = JSON.stringify(bridgeResult.responsePayload ?? bridgeResult);

      db.prepare(
        `
          UPDATE payment_transactions
          SET status = @status,
              approval_code = @approvalCode,
              reference_number = @referenceNumber,
              masked_pan = @maskedPan,
              batch_number = @batchNumber,
              error_code = @errorCode,
              error_message = @errorMessage,
              response_payload = @responsePayload,
              completed_at = @completedAt
          WHERE id = @id
        `,
      ).run({
        id: paymentId,
        status: nextStatus,
        approvalCode: bridgeResult.approvalCode ?? "",
        referenceNumber: bridgeResult.referenceNumber ?? "",
        maskedPan: bridgeResult.maskedPan ?? "",
        batchNumber: bridgeResult.batchNumber ?? "",
        errorCode: bridgeResult.errorCode ?? "",
        errorMessage: bridgeResult.errorMessage ?? "",
        responsePayload: responsePayloadText,
        completedAt: nextStatus === "pending" ? "" : new Date().toISOString(),
      });

      await appendPaymentLog(
        paymentId,
        nextStatus === "failed" ? "error" : "info",
        `Remote bridge odemesi ${nextStatus} durumuna gecti.`,
        responsePayloadText,
      );
      if (nextStatus === "approved") {
        await updateOrderById(input.orderId, {
          status: "odendi",
          payment: input.method,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ingenico bridge odemesi basarisiz.";

      db.prepare(
        `
          UPDATE payment_transactions
          SET status = 'failed',
              error_code = 'BRIDGE',
              error_message = @message,
              response_payload = @responsePayload,
              completed_at = @completedAt
          WHERE id = @id
        `,
      ).run({
        id: paymentId,
        message,
        responsePayload: JSON.stringify({ state: "bridge-error", message }),
        completedAt: new Date().toISOString(),
      });

      await appendPaymentLog(paymentId, "error", "Remote bridge odemesi basarisiz.", message);
    }
  } else {
    const responsePayload = JSON.stringify({
      state: "bridge-pending",
      note: "GMPSmartDLL bridge servisi bekleniyor. INGENICO_BRIDGE_URL tanimlandiginda istekler remote servise gider.",
    });

    db.prepare(
      `
        UPDATE payment_transactions
        SET response_payload = @responsePayload
        WHERE id = @id
      `,
    ).run({
      id: paymentId,
      responsePayload,
    });

    await appendPaymentLog(paymentId, "info", "Windows bridge odemesi beklemeye alindi.", responsePayload);
  }

  return getPaymentTransaction(paymentId);
}

export async function cancelPayment(paymentId: string) {
  const db = getDb();
  const current = await getPaymentTransaction(paymentId);

  if (!current) {
    throw new Error("Odeme bulunamadi.");
  }

  if (current.status === "approved") {
    throw new Error("Onayli odeme bu ekrandan iptal edilemez.");
  }

  const terminal = await getPaymentTerminal(current.terminalId);

  if (terminal && canUseBridge(terminal)) {
    try {
      const bridgeResult = await runBridgeCancel(terminal, {
        paymentId: current.id,
        orderId: current.orderId,
        amount: current.amount,
        referenceNumber: current.referenceNumber,
        approvalCode: current.approvalCode,
      });

      const responsePayload = JSON.stringify(bridgeResult.responsePayload ?? bridgeResult);
      db.prepare(
        `
          UPDATE payment_transactions
          SET status = 'cancelled',
              error_code = @errorCode,
              error_message = @errorMessage,
              response_payload = @responsePayload,
              completed_at = @completedAt
          WHERE id = @id
        `,
      ).run({
        id: paymentId,
        errorCode: bridgeResult.errorCode ?? "2420",
        errorMessage: bridgeResult.errorMessage ?? "Odeme iptal edildi.",
        responsePayload,
        completedAt: new Date().toISOString(),
      });

      await appendPaymentLog(paymentId, bridgeResult.ok ? "info" : "error", "Remote bridge iptal sonucu alindi.", responsePayload);
      return getPaymentTransaction(paymentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Remote bridge iptal istegi basarisiz.";
      await appendPaymentLog(paymentId, "error", "Remote bridge iptal istegi basarisiz.", message);
    }
  }

  db.prepare(
    `
      UPDATE payment_transactions
      SET status = 'cancelled',
          error_code = '2420',
          error_message = @message,
          completed_at = @completedAt
      WHERE id = @id
    `,
  ).run({
    id: paymentId,
    message: ingenicoRetcodes["2420"] ?? "Odeme iptal edildi.",
    completedAt: new Date().toISOString(),
  });

  await appendPaymentLog(paymentId, "error", "Odeme iptal edildi.", "2420");
  return getPaymentTransaction(paymentId);
}

export async function cancelActiveBridgePayment(terminalId?: string) {
  const terminal = await getPaymentTerminal(terminalId);

  if (!terminal) {
    throw new Error("Terminal bulunamadi.");
  }

  if (!canUseBridge(terminal)) {
    return { ok: false, message: "Bridge aktif degil." };
  }

  try {
    const bridgeResult = await runBridgeCancel(terminal, {
      paymentId: "",
      orderId: "",
      amount: 0,
      referenceNumber: "",
      approvalCode: "",
    });
    return { ok: bridgeResult.ok, message: bridgeResult.errorMessage ?? "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aktif Ingenico islemi iptal edilemedi.";
    throw new Error(message);
  }
}

export async function listPaymentTransactions(limit = 20) {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, order_id, terminal_id, amount, currency_code, status, method, payment_name, payment_info,
               approval_code, reference_number, masked_pan, batch_number, error_code, error_message,
               request_payload, response_payload, created_at, completed_at
        FROM payment_transactions
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT ?
      `,
    )
    .all(limit) as Array<{
      id: string;
      order_id: string;
      terminal_id: string;
      amount: number;
      currency_code: number;
      status: PaymentStatus;
      method: "kart";
      payment_name: string;
      payment_info: string;
      approval_code: string;
      reference_number: string;
      masked_pan: string;
      batch_number: string;
      error_code: string;
      error_message: string;
      request_payload: string;
      response_payload: string;
      created_at: string;
      completed_at: string;
    }>;

  return rows.map(mapPayment);
}

export async function getPaymentTransaction(id: string) {
  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT id, order_id, terminal_id, amount, currency_code, status, method, payment_name, payment_info,
               approval_code, reference_number, masked_pan, batch_number, error_code, error_message,
               request_payload, response_payload, created_at, completed_at
        FROM payment_transactions
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string;
        order_id: string;
        terminal_id: string;
        amount: number;
        currency_code: number;
        status: PaymentStatus;
        method: "kart";
        payment_name: string;
        payment_info: string;
        approval_code: string;
        reference_number: string;
        masked_pan: string;
        batch_number: string;
        error_code: string;
        error_message: string;
        request_payload: string;
        response_payload: string;
        created_at: string;
        completed_at: string;
      }
    | undefined;

  return row ? mapPayment(row) : null;
}
