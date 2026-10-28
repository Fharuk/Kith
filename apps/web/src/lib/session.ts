import { cache } from "react";
import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "student" | "landlord" | "porter" | "admin";
  pseudonymizedId: string;
  isVerified: boolean;
  sessionVersion: number;
};

/** Server-side principal. Throws nothing; returns null when anonymous. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const u = session?.user;
  if (!u?.id) return null;
  return {
    id: u.id,
    email: u.email ?? "",
    name: u.name,
    role: (u.role ?? "student") as SessionUser["role"],
    pseudonymizedId: (u.pseudonymizedId ?? "") as string,
    isVerified: Boolean(u.isVerified),
    sessionVersion: Number(u.sessionVersion ?? 0),
  };
});

export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) throw new Error("unauthenticated");
  return u;
}
