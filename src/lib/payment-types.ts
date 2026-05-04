export type PaymentStatus = "pending" | "approved" | "failed" | "cancelled";
export type PaymentMethod = "kart" | "nakit";

export type PaymentTransaction = {
  id: string;
  orderId: string;
  terminalId: string;
  amount: number;
  currencyCode: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paymentName: string;
  paymentInfo: string;
  approvalCode: string;
  referenceNumber: string;
  maskedPan: string;
  batchNumber: string;
  errorCode: string;
  errorMessage: string;
  requestPayload: string;
  responsePayload: string;
  createdAt: string;
  completedAt: string;
};

export type TerminalPrecheckResult = {
  ready: boolean;
  pairingRequired: boolean;
  connectionSummary: string;
  message: string;
  logs: string[];
};

export type TerminalPairingResult = {
  ok: boolean;
  message: string;
  responseSummary: string;
  logs: string[];
};
