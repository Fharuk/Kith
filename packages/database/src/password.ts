import { hash, verify, type Options } from "@node-rs/argon2";

/** OWASP 2024 recommended argon2id parameters. */
const ARGON2: Options = {
  memoryCost: 65_536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
};

export const hashPassword = (plain: string) => hash(plain, ARGON2);
export const verifyPassword = (plain: string, encoded: string) => verify(encoded, plain, ARGON2);

/** Public identity: never expose UUIDs (analysis §3). */
export function generatePseudonymizedId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `KH-${body.slice(0, 4)}-${body.slice(4)}`;
}
