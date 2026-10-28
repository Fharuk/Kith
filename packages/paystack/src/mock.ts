import type {
  PaystackDriver, InitializeParams, InitializeResult, VerifyResult,
  Bank, ResolvedAccount, RecipientInput, RecipientResult, TransferInput, TransferResult,
  RefundInput, RefundResult,
} from "./api";
import { signWebhookBody, PAYSTACK_EVENTS, type ChargeSuccessData } from "./webhook";
import { createHash } from "node:crypto";

/**
 * MockPaystack — offline driver for BOTH halves of the money story.
 *
 * IN  (initialize/verify/refund): `initialize` returns an app-relative URL to Kith's own
 *     hosted test checkout. The mock-pay endpoint "charges" the reference and builds a
 *     properly HMAC-signed `charge.success`, fed through the SAME webhook handler as live
 *     traffic. Signature verification is therefore never bypassed in any environment.
 *
 * OUT (banks/recipients/transfers): deterministic Nigerian bank list, resolving rules that
 *     mirror Paystack's (10-digit NUBAN), and instant transfers whose failure paths are
 *     addressable on purpose — account numbers ending `00` fail, ending `99` reverse — so
 *     retry, backoff and reversal handling are all exercisable without a vendor.
 */

/** Real Nigerian bank codes, so stored data is production-shaped. */
const MOCK_BANKS: Bank[] = [
  { code: "044", name: "Access Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "999992", name: "OPay Digital Services" },
  { code: "035", name: "Wema Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "076", name: "Polaris Bank" },
];

const hash = (v: string) => createHash("sha256").update(v).digest("hex");

export class MockPaystack implements PaystackDriver {
  readonly mode = "mock" as const;
  private readonly transfers = new Map<string, TransferResult>();
  /** recipientCode → account number, so transfer outcomes can mirror the destination */
  private readonly recipients = new Map<string, { accountNumber: string; name: string }>();

  constructor(
    private readonly opts: {
      webhookSecret: string;
      /** Where the hosted mock checkout lives. Relative URLs are allowed (same app). */
      checkoutPath?: string;
    },
  ) {}

  /* ── money in ───────────────────────────────────────────────────────── */

  async initialize(p: InitializeParams): Promise<InitializeResult> {
    if (p.amountKobo <= 0n) throw new Error("MockPaystack: amount must be positive kobo");
    const path = this.opts.checkoutPath ?? "/checkout/mock";
    return {
      authorizationUrl: `${path}?ref=${encodeURIComponent(p.reference)}`,
      accessCode: `mock_${p.reference}`,
      reference: p.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    // The signed webhook is the source of truth in mock mode; verify never claims success
    // on its own so the flow cannot shortcut the webhook handler.
    return { status: "pending", reference, amountKobo: null, currency: "NGN", paidAt: null, channel: "mock", gatewayResponse: null };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    if (!input.transactionReference) throw new Error("MockPaystack: refund requires the original reference");
    return {
      refundReference: `RFD_mock_${hash(input.transactionReference).slice(0, 12)}`,
      status: "processed",
      amountKobo: input.amountKobo ?? null,
    };
  }

  /* ── money out ──────────────────────────────────────────────────────── */

  async listBanks(): Promise<Bank[]> {
    return [...MOCK_BANKS];
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<ResolvedAccount> {
    if (!/^\d{10}$/.test(accountNumber)) {
      throw new Error("Could not resolve account: NUBAN must be 10 digits");
    }
    if (accountNumber.endsWith("0000")) {
      throw new Error("Could not resolve account: account not found");
    }
    const bank = MOCK_BANKS.find((b) => b.code === bankCode);
    if (!bank) throw new Error("Could not resolve account: unknown bank code");
    // Deterministic, obviously-fake-but-realistic name derived from the account number.
    const names = ["ADUNOLA OKAFOR", "BALOGUN ESTATES LTD", "EMEKA NWOSU", "FATIMA BELLO", "CHINEDU EZE"];
    const name = names[Number(accountNumber.slice(-1)) % names.length] ?? names[0]!;
    return { accountNumber, accountName: name, bankId: Number(bankCode) || null };
  }

  async createRecipient(input: RecipientInput): Promise<RecipientResult> {
    if (!/^\d{10}$/.test(input.accountNumber)) throw new Error("MockPaystack: invalid account number");
    const recipientCode = `RCP_mock_${hash(`${input.bankCode}:${input.accountNumber}`).slice(0, 14)}`;
    const existing = this.recipients.has(recipientCode);
    this.recipients.set(recipientCode, { accountNumber: input.accountNumber, name: input.name });
    return { recipientCode, existing };
  }

  async initiateTransfer(input: TransferInput): Promise<TransferResult> {
    if (input.amountKobo <= 0n) throw new Error("MockPaystack: transfer amount must be positive kobo");
    if (!input.recipientCode) throw new Error("MockPaystack: transfer requires a recipient code");

    const destination = this.recipients.get(input.recipientCode)?.accountNumber ?? "";
    // Deterministic outcomes so failure/retry/reversal paths are testable without a vendor:
    //   ·•••••00 → instant failure   (bank rejects the account)
    //   ·•••••99 → stays pending     (a transfer.reversed webhook arrives later)
    //   otherwise → success
    const status: TransferResult["status"] = destination.endsWith("00")
      ? "failed"
      : destination.endsWith("99")
        ? "pending"
        : "success";

    const result: TransferResult = {
      transferCode: `TRF_mock_${hash(input.reference).slice(0, 12).toUpperCase()}`,
      reference: input.reference,
      status,
      failureReason: status === "failed" ? "Destination account could not be credited" : null,
    };
    this.transfers.set(input.reference, result);
    return result;
  }

  async verifyTransfer(reference: string): Promise<TransferResult> {
    return (
      this.transfers.get(reference) ?? {
        transferCode: "",
        reference,
        status: "pending",
        failureReason: null,
      }
    );
  }

  /* ── webhook builders (used by tests and the mock-pay endpoint) ─────── */

  /** Build a signed charge.success webhook (body + header value) for a "paid" reference. */
  buildChargeSuccess(data: Omit<ChargeSuccessData, "status" | "paid_at" | "channel"> & { paid_at?: string | null }): {
    rawBody: string;
    signature: string;
    event: string;
  } {
    const payload: ChargeSuccessData = {
      ...data,
      status: "success",
      paid_at: data.paid_at ?? new Date().toISOString(),
      channel: "mock",
    };
    const rawBody = JSON.stringify({ event: PAYSTACK_EVENTS.chargeSuccess, data: payload });
    return { rawBody, signature: signWebhookBody(rawBody, this.opts.webhookSecret), event: PAYSTACK_EVENTS.chargeSuccess };
  }

  /** Build a signed transfer.* webhook so payout confirmation is testable end to end. */
  buildTransferEvent(
    event: typeof PAYSTACK_EVENTS.transferSuccess | typeof PAYSTACK_EVENTS.transferFailed | typeof PAYSTACK_EVENTS.transferReversed,
    data: { reference: string; transferCode?: string; amount: number; reason?: string },
  ): { rawBody: string; signature: string; event: string } {
    const rawBody = JSON.stringify({
      event,
      data: {
        reference: data.reference,
        transfer_code: data.transferCode ?? `TRF_mock_${hash(data.reference).slice(0, 12).toUpperCase()}`,
        amount: data.amount,
        currency: "NGN",
        status: event === PAYSTACK_EVENTS.transferSuccess ? "success" : event === PAYSTACK_EVENTS.transferFailed ? "failed" : "reversed",
        reason: data.reason ?? null,
        occurred_at: new Date().toISOString(),
      },
    });
    return { rawBody, signature: signWebhookBody(rawBody, this.opts.webhookSecret), event };
  }
}
