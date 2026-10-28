import { z } from "zod";

export interface University {
  code: string;
  name: string;
  city: string;
  emailDomains: readonly string[];
  matricPattern: RegExp;
  active: boolean;
}

/** Launch cohort. Grows via the admin console; regexes are data, not code paths. */
export const UNIVERSITIES: readonly University[] = [
  {
    code: "funaab",
    name: "Federal University of Agriculture, Abeokuta",
    city: "Abeokuta",
    emailDomains: ["funaab.edu.ng", "stu.funaab.edu.ng"],
    matricPattern: /^U\d{2}\/[A-Z]{2,5}\/\d{3,4}$/,
    active: true,
  },
  {
    code: "unilag",
    name: "University of Lagos",
    city: "Lagos",
    emailDomains: ["stu.unilag.edu.ng", "unilag.edu.ng"],
    // Patterns are registrar-provided *data* (admin-configurable pre-launch); intentionally
    // permissive on digit-run length so real students are never locked out by a typo in our regex.
    matricPattern: /^\d{2}[A-Z]{2,5}\d{4,7}$/,
    active: true,
  },
];

export const MatricInput = z.object({
  universityCode: z.string().min(2),
  matricNumber: z.string().min(4).max(30),
  studentEmail: z.string().email(),
});
export type MatricInput = z.infer<typeof MatricInput>;

export type MatricFailure = "unknown_university" | "university_inactive" | "matric_format" | "email_domain";

export function validateMatric(input: MatricInput, registry: readonly University[] = UNIVERSITIES): { ok: true; university: University } | { ok: false; code: MatricFailure } {
  const uni = registry.find((u) => u.code === input.universityCode.toLowerCase());
  if (!uni) return { ok: false, code: "unknown_university" };
  if (!uni.active) return { ok: false, code: "university_inactive" };
  if (!uni.matricPattern.test(input.matricNumber.toUpperCase())) return { ok: false, code: "matric_format" };
  const domain = input.studentEmail.split("@")[1]?.toLowerCase();
  if (!domain || !uni.emailDomains.includes(domain)) return { ok: false, code: "email_domain" };
  return { ok: true, university: uni };
}

/** NIN: 11 digits. We only ever store sha256(nin + pepper) — never the raw value. */
export const NIN_PATTERN = /^\d{11}$/;
export function isValidNin(nin: string): boolean {
  return NIN_PATTERN.test(nin);
}
