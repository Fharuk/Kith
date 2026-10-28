import { createHmac, randomBytes } from "node:crypto";

/**
 * TOTP for ACCOUNT 2FA (RFC 6238, 30-second step).
 *
 * Deliberately separate from the guest-pass TOTP: those codes open a building and rotate every
 * 5 minutes with a ±1 window; account codes are 30s, single-use per step, and only ever
 * verified against an encrypted seed. Sharing one implementation between them would force one
 * set of parameters on two very different threat models.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(bytes = 20): string {
  const buf = randomBytes(bytes);
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(secret: string): Buffer {
  const clean = secret.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error("Invalid base32 secret");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function hotp(secret: string, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f;
  const bin =
    (((digest[offset] ?? 0) & 0x7f) << 24) |
    (((digest[offset + 1] ?? 0) & 0xff) << 16) |
    (((digest[offset + 2] ?? 0) & 0xff) << 8) |
    ((digest[offset + 3] ?? 0) & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, "0");
}

export function totpAt(secret: string, atMs = Date.now(), stepSeconds = 30): string {
  return hotp(secret, Math.floor(atMs / 1000 / stepSeconds));
}

/** Accept the current step and ±1 for clock skew. Uniform-time comparison happens upstream. */
export function verifyTotp(secret: string, code: string, atMs = Date.now(), stepSeconds = 30): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  return [-1, 0, 1].some((w) => totpAt(secret, atMs + w * stepSeconds * 1000, stepSeconds) === normalized);
}

/** The otpauth:// URI authenticator apps consume. Never log this. */
export function otpauthUrl(input: { secret: string; email: string; issuer?: string }) {
  const issuer = input.issuer ?? "Kith";
  const label = encodeURIComponent(`${issuer}:${input.email}`);
  return `otpauth://totp/${label}?secret=${input.secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Group the seed for manual entry: XXXX XXXX XXXX. */
export function formatSecretForDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}
