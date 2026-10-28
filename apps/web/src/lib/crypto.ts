import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * ENVELOPE ENCRYPTION FOR SECRETS AT REST.
 *
 * TOTP seeds are bearer credentials: whoever reads one can mint valid codes forever. They are
 * therefore never stored in plaintext. AES-256-GCM (authenticated — tampering is detected, not
 * silently decrypted), random IV per record, version-tagged so the key can be rotated later
 * without a flag day.
 *
 * Key resolution: APP_ENCRYPTION_KEY if set (base64, 32 bytes), otherwise derived from
 * AUTH_SECRET with scrypt and a fixed salt. Deriving is acceptable for dev; production should
 * set a dedicated key so rotating sessions does not invalidate every TOTP seed.
 */
const PREFIX = "v1";
const SALT = "kith.totp.v1";

function key(): Buffer {
  const explicit = (process.env.APP_ENCRYPTION_KEY ?? "").trim();
  if (explicit) {
    const buf = Buffer.from(explicit, "base64");
    if (buf.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes of base64");
    return buf;
  }
  const fallback = process.env.AUTH_SECRET ?? "kith-dev-only-secret";
  return scryptSync(fallback, SALT, 32);
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const [version, body] = payload.split(":");
  if (version !== PREFIX || !body) throw new Error("Unsupported secret format");
  const raw = Buffer.from(body, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Constant-time string comparison for anything token-shaped. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
