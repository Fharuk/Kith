import { createHmac, createHash } from "node:crypto";

/**
 * RFC 6238-style 6-digit rotating code, 300s step (schema guest_passes.step_seconds).
 * Demo secrets are arbitrary strings hashed to a key; production stores an AES-256-GCM
 * encrypted base32 secret and decrypts server-side — the secret NEVER reaches the browser
 * (the pass page polls /api/passes/code, which computes codes server-side).
 */
export function totpCode(secret: string, stepSeconds = 300, atMs = Date.now()): string {
  const counter = Math.floor(atMs / 1000 / stepSeconds);
  const key = createHash("sha256").update(secret).digest();
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (bin % 1_000_000).toString().padStart(6, "0");
}

/** Accept current ± 1 window (grace for clock skew at the porter terminal). */
export function totpVerify(secret: string, code: string, stepSeconds = 300, atMs = Date.now()): boolean {
  return [-1, 0, 1].some((w) => totpCode(secret, stepSeconds, atMs + w * stepSeconds * 1000) === code);
}

export function currentStepExpiresAt(stepSeconds = 300, atMs = Date.now()): number {
  return (Math.floor(atMs / 1000 / stepSeconds) + 1) * stepSeconds * 1000;
}
