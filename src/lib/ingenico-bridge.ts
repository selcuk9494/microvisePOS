import type { PaymentTerminal } from "@/lib/pos-data";
import type { TerminalPairingResult, TerminalPrecheckResult } from "@/lib/payment-types";

type BridgeResultEnvelope<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export type BridgePaymentResult = {
  status: "approved" | "pending" | "failed";
  approvalCode?: string;
  referenceNumber?: string;
  maskedPan?: string;
  batchNumber?: string;
  errorCode?: string;
  errorMessage?: string;
  responsePayload?: unknown;
  logs?: string[];
};

export type BridgeCancelResult = {
  ok: boolean;
  errorCode?: string;
  errorMessage?: string;
  responsePayload?: unknown;
  logs?: string[];
};

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getIngenicoBridgeUrl() {
  const value = process.env.INGENICO_BRIDGE_URL?.trim();
  return value ? normalizeBaseUrl(value) : "";
}

export function isIngenicoBridgeEnabled() {
  return Boolean(getIngenicoBridgeUrl());
}

function buildTerminalPayload(terminal: PaymentTerminal) {
  return {
    id: terminal.id,
    name: terminal.name,
    brand: terminal.brand,
    model: terminal.model,
    interfaceId: terminal.interfaceId,
    connectionMode: terminal.connectionMode,
    ipAddress: terminal.ipAddress,
    port: terminal.port,
    portName: terminal.portName,
    baudRate: terminal.baudRate,
    defaultTimeoutMs: terminal.defaultTimeoutMs,
    cardTimeoutMs: terminal.cardTimeoutMs,
    serialNumber: terminal.serialNumber,
    ecrSerialNumber: terminal.ecrSerialNumber,
    externalDeviceBrand: terminal.externalDeviceBrand,
    externalDeviceModel: terminal.externalDeviceModel,
  };
}

async function postBridge<T>(path: string, payload: unknown, timeoutMs = 45000): Promise<T> {
  const bridgeUrl = getIngenicoBridgeUrl();

  if (!bridgeUrl) {
    throw new Error("INGENICO_BRIDGE_URL tanimli degil.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${bridgeUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const responseText = await response.text();
    const raw = responseText ? (JSON.parse(responseText) as BridgeResultEnvelope<T> | T) : null;

    if (!response.ok) {
      const message =
        typeof raw === "object" && raw && "message" in raw && typeof raw.message === "string"
          ? raw.message
          : responseText || "Ingenico bridge cagrisinda hata olustu.";
      throw new Error(message);
    }

    if (!raw) {
      throw new Error("Ingenico bridge bos cevap dondurdu.");
    }

    if (typeof raw === "object" && "ok" in raw) {
      if (!raw.ok) {
        throw new Error(raw.message ?? "Ingenico bridge istegi basarisiz.");
      }
      return raw.data as T;
    }

    return raw as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Ingenico bridge zaman asimina ugradi.");
    }
    if (error instanceof TypeError) {
      throw new Error(`Ingenico bridge'e baglanilamadi: ${bridgeUrl}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runBridgePrecheck(terminal: PaymentTerminal) {
  return postBridge<TerminalPrecheckResult>("/precheck", {
    terminal: buildTerminalPayload(terminal),
  }, Math.max(terminal.defaultTimeoutMs + 15000, 45000));
}

export async function runBridgePairing(terminal: PaymentTerminal) {
  return postBridge<TerminalPairingResult>("/pairing", {
    terminal: buildTerminalPayload(terminal),
  }, Math.max(terminal.defaultTimeoutMs + 15000, 45000));
}

export async function runBridgePayment(
  terminal: PaymentTerminal,
  payload: {
    paymentId: string;
    orderId: string;
    amount: number;
    method: "kart" | "nakit";
    items: Array<{ id: number; name: string; qty: number; price: number; note?: string }>;
    paymentName: string;
    paymentInfo: string;
    requestPayload: unknown;
  },
) {
  return postBridge<BridgePaymentResult>("/payment", {
    terminal: buildTerminalPayload(terminal),
    payment: payload,
  }, Math.max(terminal.cardTimeoutMs + 15000, 75000));
}

export async function runBridgeCancel(
  terminal: PaymentTerminal,
  payload: {
    paymentId: string;
    orderId: string;
    amount: number;
    referenceNumber: string;
    approvalCode: string;
  },
) {
  return postBridge<BridgeCancelResult>("/cancel", {
    terminal: buildTerminalPayload(terminal),
    payment: payload,
  }, Math.max(terminal.defaultTimeoutMs + 15000, 45000));
}
