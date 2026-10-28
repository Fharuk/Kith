import { describe, expect, it, beforeEach } from "vitest";
import { randomBytes } from "node:crypto";
import { decryptSecret, encryptSecret, safeEqual } from "@/lib/crypto";

describe("envelope encryption (AES-256-GCM)", () => {
  beforeEach(() => {
    process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  it("round-trips a secret without exposing the plaintext", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const sealed = encryptSecret(secret);
    expect(sealed).not.toContain(secret);
    expect(sealed.startsWith("v1:")).toBe(true);
    expect(decryptSecret(sealed)).toBe(secret);
  });

  it("produces a different ciphertext each time (fresh IV)", () => {
    const secret = "same-secret";
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret));
  });

  it("rejects a tampered ciphertext instead of returning garbage", () => {
    const sealed = encryptSecret("bank-details");
    const [prefix, body] = sealed.split(":");
    const flipped = Buffer.from(body!, "base64");
    const last = flipped.length - 1;
    flipped[last] = (flipped[last] ?? 0) ^ 0xff;
    const tampered = `${prefix}:${flipped.toString("base64")}`;
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("fails when the key changes", () => {
    const sealed = encryptSecret("rotate-me");
    process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    expect(() => decryptSecret(sealed)).toThrow();
  });

  it("rejects malformed input rather than guessing", () => {
    expect(() => decryptSecret("not-sealed")).toThrow();
    expect(() => decryptSecret("v1:")).toThrow();
  });

  it("falls back to a key derived from AUTH_SECRET when no dedicated key is set", () => {
    delete process.env.APP_ENCRYPTION_KEY;
    process.env.AUTH_SECRET = "test-auth-secret-for-derivation";
    const sealed = encryptSecret("derived-key-secret");
    expect(decryptSecret(sealed)).toBe("derived-key-secret");
  });
});

describe("safeEqual", () => {
  it("matches identical strings and rejects different ones", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });

  it("does not throw on length mismatch", () => {
    expect(safeEqual("short", "a-much-longer-value")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });
});
