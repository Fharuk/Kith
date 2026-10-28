import type { PaystackConfig } from "./config";

/**
 * Paystack REST driver. Two halves of the money story:
 *
 *  · IN  — initialize + verify + refund  (student pays into escrow)
 *  · OUT — banks, account resolution, transfer recipients, transfers (landlord payout)
 *
 * All money crosses as kobo BigInt internally and integer kobo on the wire
 * (Paystack amounts are integers; JS numbers are exact below 2^53).
 */

export interface InitializeParams {
  email: string;
  amountKobo: bigint;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export type VerifyStatus = "success" | "failed" | "pending" | "abandoned";

export interface VerifyResult {
  status: VerifyStatus;
  reference: string;
  amountKobo: bigint | null;
  currency: string | null;
  paidAt: string | null;
  channel: string | null;
  gatewayResponse: string | null;
}

/* ── payouts: banks, recipients, transfers ─────────────────────────────── */

export interface Bank {
  code: string;
  name: string;
}

export interface ResolvedAccount {
  accountNumber: string;
  accountName: string;
  bankId: number | null;
}

export interface RecipientInput {
  name: string;
  accountNumber: string;
  bankCode: string;
  currency?: string;
}

export interface RecipientResult {
  recipientCode: string;
  /** true when Paystack already knew this destination (idempotent create) */
  existing: boolean;
}

export interface TransferInput {
  amountKobo: bigint;
  recipientCode: string;
  /** unique per disbursement — the idempotency key Paystack dedupes on */
  reference: string;
  reason?: string;
}

export type TransferState = "pending" | "success" | "failed" | "reversed";

export interface TransferResult {
  transferCode: string;
  reference: string;
  status: TransferState;
  failureReason?: string | null;
}

export interface RefundInput {
  /** the ORIGINAL charge reference sitting in escrow */
  transactionReference: string;
  amountKobo?: bigint;
  reason?: string;
}

export interface RefundResult {
  refundReference: string;
  status: "pending" | "processing" | "processed" | "failed";
  amountKobo: bigint | null;
}

export interface PaystackDriver {
  readonly mode: "live" | "mock";
  /* money in */
  initialize(params: InitializeParams): Promise<InitializeResult>;
  verify(reference: string): Promise<VerifyResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  /* money out */
  listBanks(): Promise<Bank[]>;
  resolveAccount(accountNumber: string, bankCode: string): Promise<ResolvedAccount>;
  createRecipient(input: RecipientInput): Promise<RecipientResult>;
  initiateTransfer(input: TransferInput): Promise<TransferResult>;
  verifyTransfer(reference: string): Promise<TransferResult>;
}

export class PaystackApiError extends Error {
  constructor(message: string, readonly status: number, readonly body?: unknown) {
    super(message);
    this.name = "PaystackApiError";
  }
}

export class LivePaystack implements PaystackDriver {
  readonly mode = "live" as const;

  constructor(private readonly cfg: PaystackConfig) {
    if (!cfg.secretKey) throw new PaystackApiError("LivePaystack requires PAYSTACK_SECRET_KEY", 0);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.cfg.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.cfg.secretKey}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const body = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
    if (!res.ok || !body?.status) {
      throw new PaystackApiError(body?.message ?? `Paystack ${path} failed (${res.status})`, res.status, body);
    }
    return body.data as T;
  }

  async initialize(p: InitializeParams): Promise<InitializeResult> {
    if (p.amountKobo <= 0n) throw new PaystackApiError("amount must be positive kobo", 0);
    const data = await this.request<{ authorization_url: string; access_code: string; reference: string }>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          email: p.email,
          amount: Number(p.amountKobo), // Paystack wants integer kobo; JS number is exact below 2^53
          reference: p.reference,
          callback_url: p.callbackUrl,
          currency: "NGN",
          metadata: p.metadata ?? undefined,
        }),
      },
    );
    return { authorizationUrl: data.authorization_url, accessCode: data.access_code, reference: data.reference };
  }

  async verify(reference: string): Promise<VerifyResult> {
    const data = await this.request<{
      status: string;
      reference: string;
      amount: number;
      currency: string;
      paid_at: string | null;
      channel: string | null;
      gateway_response: string | null;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);
    const status: VerifyStatus =
      data.status === "success" ? "success" : data.status === "failed" ? "failed" : data.status === "abandoned" ? "abandoned" : "pending";
    return {
      status,
      reference: data.reference,
      amountKobo: typeof data.amount === "number" ? BigInt(data.amount) : null,
      currency: data.currency ?? null,
      paidAt: data.paid_at ?? null,
      channel: data.channel ?? null,
      gatewayResponse: data.gateway_response ?? null,
    };
  }

  /* ── money in: refund ───────────────────────────────────────────────── */

  async refund(input: RefundInput): Promise<RefundResult> {
    const data = await this.request<{
      reference?: string;
      id?: number;
      status?: string;
      amount?: number;
    }>("/refund", {
      method: "POST",
      body: JSON.stringify({
        transaction: input.transactionReference,
        amount: input.amountKobo !== undefined ? Number(input.amountKobo) : undefined,
        merchant_note: input.reason ?? "Kith dispute resolution",
      }),
    });
    const status = (data.status ?? "pending").toLowerCase();
    return {
      refundReference: data.reference ?? (data.id !== undefined ? String(data.id) : ""),
      status:
        status === "processed" ? "processed" : status === "processing" ? "processing" : status === "failed" ? "failed" : "pending",
      amountKobo: typeof data.amount === "number" ? BigInt(data.amount) : null,
    };
  }

  /* ── money out ──────────────────────────────────────────────────────── */

  async listBanks(): Promise<Bank[]> {
    const data = await this.request<Array<{ code: string; name: string }>>("/bank?country=nigeria&currency=NGN");
    return data.map((b) => ({ code: b.code, name: b.name }));
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<ResolvedAccount> {
    const data = await this.request<{ account_number: string; account_name: string; bank_id?: number }>(
      `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    );
    return {
      accountNumber: data.account_number,
      accountName: data.account_name,
      bankId: data.bank_id ?? null,
    };
  }

  async createRecipient(input: RecipientInput): Promise<RecipientResult> {
    const data = await this.request<{ recipient_code: string; details?: { account_number?: string } }>("/transferrecipient", {
      method: "POST",
      body: JSON.stringify({
        type: "nuban",
        name: input.name,
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: input.currency ?? "NGN",
      }),
    });
    return { recipientCode: data.recipient_code, existing: false };
  }

  async initiateTransfer(input: TransferInput): Promise<TransferResult> {
    if (input.amountKobo <= 0n) throw new PaystackApiError("transfer amount must be positive kobo", 0);
    const data = await this.request<{
      transfer_code?: string;
      reference?: string;
      status?: string;
      reason?: string;
    }>("/transfer", {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount: Number(input.amountKobo),
        recipient: input.recipientCode,
        reference: input.reference,
        reason: input.reason ?? "Kith landlord payout",
      }),
    });
    return {
      transferCode: data.transfer_code ?? "",
      reference: data.reference ?? input.reference,
      status: mapTransferState(data.status),
      failureReason: data.reason ?? null,
    };
  }

  async verifyTransfer(reference: string): Promise<TransferResult> {
    const data = await this.request<{
      transfer_code?: string;
      reference?: string;
      status?: string;
      reason?: string;
    }>(`/transfer/verify/${encodeURIComponent(reference)}`);
    return {
      transferCode: data.transfer_code ?? "",
      reference: data.reference ?? reference,
      status: mapTransferState(data.status),
      failureReason: data.reason ?? null,
    };
  }
}

function mapTransferState(status: string | undefined): TransferState {
  switch ((status ?? "").toLowerCase()) {
    case "success":
    case "successful":
      return "success";
    case "failed":
      return "failed";
    case "reversed":
      return "reversed";
    default:
      return "pending";
  }
}
