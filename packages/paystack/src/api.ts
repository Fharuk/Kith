import type { PaystackConfig } from "./config";

/**
 * Paystack REST driver (live mode). Thin, typed, and deliberately small:
 * initialize + verify cover the booking golden flow; payouts (transfer API) land
 * with the landlord-wallet slice. All money crosses as kobo BigInt internally and
 * plain integers on the wire (Paystack amounts are integer kobo).
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

export interface PaystackDriver {
  readonly mode: "live" | "mock";
  initialize(params: InitializeParams): Promise<InitializeResult>;
  verify(reference: string): Promise<VerifyResult>;
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
}
