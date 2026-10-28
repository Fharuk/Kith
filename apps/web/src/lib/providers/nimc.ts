/**
 * NIMC identity verification — one interface, two drivers.
 *
 * Contract: Kith never stores a NIN. The provider returns a verified flag plus its own
 * reference id; we keep only sha256(nin + pepper) for de-duplication and dispute checks.
 *
 * Drivers are selected by env (MOCKS-FIRST — playbook 03):
 *   NIMC_API_KEY unset  → MockNimc   (11-digit NINs verify; 00000000000 is rejected)
 *   NIMC_API_KEY set    → LiveNimc   (NIMC "Verify NIN" style REST endpoint)
 *
 * Swapping drivers is an env change, never a code change.
 */

export interface NinVerifyInput {
  nin: string;
  firstName: string;
  lastName: string;
  /** ISO date (YYYY-MM-DD) — required by NIMC for name matching. */
  dateOfBirth: string;
}

export interface NinVerifyResult {
  verified: boolean;
  providerReference: string | null;
  /** True when the NIN exists and the name matched; false otherwise. */
  nameMatched: boolean;
  failureReason?: "not_found" | "name_mismatch" | "provider_error" | "invalid_input";
}

export interface NinProvider {
  readonly mode: "mock" | "live";
  verify(input: NinVerifyInput): Promise<NinVerifyResult>;
}

const NIN_RE = /^\d{11}$/;

export class MockNimc implements NinProvider {
  readonly mode = "mock" as const;

  async verify(input: NinVerifyInput): Promise<NinVerifyResult> {
    if (!NIN_RE.test(input.nin)) {
      return { verified: false, providerReference: null, nameMatched: false, failureReason: "invalid_input" };
    }
    // Deterministic demo rule: one NIN is reserved as "not found" so failure paths are testable.
    if (input.nin === "00000000000") {
      return { verified: false, providerReference: null, nameMatched: false, failureReason: "not_found" };
    }
    return {
      verified: true,
      providerReference: `mock-nimc-${input.nin.slice(-4)}`,
      nameMatched: true,
    };
  }
}

export class LiveNimc implements NinProvider {
  readonly mode = "live" as const;

  constructor(private readonly config: { apiKey: string; baseUrl: string; timeoutMs?: number }) {}

  async verify(input: NinVerifyInput): Promise<NinVerifyResult> {
    if (!NIN_RE.test(input.nin)) {
      return { verified: false, providerReference: null, nameMatched: false, failureReason: "invalid_input" };
    }
    try {
      const res = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/nin/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin: input.nin,
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 12_000),
      });

      if (res.status === 404) {
        return { verified: false, providerReference: null, nameMatched: false, failureReason: "not_found" };
      }
      if (!res.ok) {
        return { verified: false, providerReference: null, nameMatched: false, failureReason: "provider_error" };
      }

      const data = (await res.json()) as {
        status?: boolean | string;
        reference?: string;
        reference_id?: string;
        nameMatch?: boolean;
        name_match?: boolean;
        message?: string;
      };
      const verified = data.status === true || data.status === "success";
      const nameMatched = Boolean(data.nameMatch ?? data.name_match ?? verified);
      return {
        verified: verified && nameMatched,
        providerReference: data.reference ?? data.reference_id ?? null,
        nameMatched,
        failureReason: verified && nameMatched ? undefined : "name_mismatch",
      };
    } catch {
      return { verified: false, providerReference: null, nameMatched: false, failureReason: "provider_error" };
    }
  }
}

export function getNimcProvider(): NinProvider {
  const apiKey = (process.env.NIMC_API_KEY ?? "").trim();
  const baseUrl = (process.env.NIMC_BASE_URL ?? "").trim();
  if (apiKey && baseUrl) return new LiveNimc({ apiKey, baseUrl });
  return new MockNimc();
}
