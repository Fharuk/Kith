import { describe, expect, it } from "vitest";
import { totpCode, totpVerify, currentStepExpiresAt } from "@/lib/totp";

const STEP = 300;
// Fixed instant: 2026-10-28T12:00:00Z → deterministic counter
const T = Date.UTC(2026, 9, 28, 12, 0, 0);

describe("guest-pass TOTP", () => {
  it("is deterministic for a secret and time step", () => {
    expect(totpCode("demo-secret", STEP, T)).toBe(totpCode("demo-secret", STEP, T));
  });

  it("is always exactly six digits", () => {
    for (let i = 0; i < 50; i++) {
      const code = totpCode(`secret-${i}`, STEP, T + i * 1000);
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it("changes every step", () => {
    const a = totpCode("demo-secret", STEP, T);
    const b = totpCode("demo-secret", STEP, T + STEP * 1000);
    expect(a).not.toBe(b);
  });

  it("differs across secrets at the same step (no collision by construction)", () => {
    const codes = new Set(Array.from({ length: 25 }, (_, i) => totpCode(`s-${i}`, STEP, T)));
    expect(codes.size).toBeGreaterThan(20);
  });

  it("accepts only the current window ±1 (clock-skew grace)", () => {
    const code = totpCode("demo-secret", STEP, T);
    expect(totpVerify("demo-secret", code, STEP, T)).toBe(true);
    expect(totpVerify("demo-secret", code, STEP, T + STEP * 1000)).toBe(true); // previous step
    expect(totpVerify("demo-secret", code, STEP, T - STEP * 1000)).toBe(true); // next step
    expect(totpVerify("demo-secret", code, STEP, T + STEP * 2000)).toBe(false); // too old
    expect(totpVerify("demo-secret", code, STEP, T - STEP * 2000)).toBe(false);
  });

  it("rejects a code presented with the wrong secret", () => {
    const code = totpCode("demo-secret", STEP, T);
    expect(totpVerify("attacker-secret", code, STEP, T)).toBe(false);
  });

  it("rejects malformed codes", () => {
    expect(totpVerify("demo-secret", "", STEP, T)).toBe(false);
    expect(totpVerify("demo-secret", "12345", STEP, T)).toBe(false);
    expect(totpVerify("demo-secret", "abcdef", STEP, T)).toBe(false);
  });

  it("expiry lands on the step boundary in the future", () => {
    const expiry = currentStepExpiresAt(STEP, T);
    expect(expiry).toBe(T + STEP * 1000);
    expect(expiry).toBeGreaterThan(T);
  });
});
