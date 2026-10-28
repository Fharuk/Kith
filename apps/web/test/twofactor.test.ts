import { describe, expect, it } from "vitest";
import { formatSecretForDisplay, generateTotpSecret, hotp, otpauthUrl, totpAt, verifyTotp } from "@/lib/twofactor";

/** RFC 6238 test secret (ASCII "12345678901234567890"), base32-encoded. */
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("account TOTP", () => {
  it("matches the RFC 6238 SHA-1 vector", () => {
    // T = 59s → 94287082 at 8 digits, so 287082 at the 6 digits the UI asks for.
    expect(totpAt(RFC_SECRET, 59_000)).toBe("287082");
    expect(hotp(RFC_SECRET, 1, 8)).toBe("94287082");
  });

  it("rotates every 30 seconds", () => {
    const a = totpAt(RFC_SECRET, 59_000);
    const b = totpAt(RFC_SECRET, 89_000);
    expect(a).not.toBe(b);
  });

  it("accepts one step of clock skew in either direction", () => {
    const now = 1_700_000_000_000;
    const [previous, current, next] = [-1, 0, 1].map((w) => totpAt(RFC_SECRET, now + w * 30_000));
    expect(verifyTotp(RFC_SECRET, current!, now)).toBe(true);
    expect(verifyTotp(RFC_SECRET, previous!, now)).toBe(true);
    expect(verifyTotp(RFC_SECRET, next!, now)).toBe(true);
  });

  it("rejects codes two steps away and malformed input", () => {
    const now = 1_700_000_000_000;
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, now - 90_000), now)).toBe(false);
    expect(verifyTotp(RFC_SECRET, "12345", now)).toBe(false);
    expect(verifyTotp(RFC_SECRET, "abcdef", now)).toBe(false);
    expect(verifyTotp(RFC_SECRET, "", now)).toBe(false);
  });

  it("tolerates spaces in the typed code", () => {
    const now = 1_700_000_000_000;
    const code = totpAt(RFC_SECRET, now);
    expect(verifyTotp(RFC_SECRET, `${code.slice(0, 3)} ${code.slice(3)}`, now)).toBe(true);
  });

  it("generates unique 160-bit seeds", () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(a).toMatch(/^[A-Z2-7]{32}$/);
    expect(a).not.toBe(b);
  });

  it("builds an otpauth URI authenticator apps accept", () => {
    const url = otpauthUrl({ secret: RFC_SECRET, email: "ada@stu.unilag.edu.ng" });
    expect(url.startsWith("otpauth://totp/Kith%3A")).toBe(true);
    expect(url).toContain(`secret=${RFC_SECRET}`);
    expect(url).toContain("period=30");
  });

  it("groups the seed for manual entry", () => {
    expect(formatSecretForDisplay("ABCDEFGH")).toBe("ABCD EFGH");
  });
});
