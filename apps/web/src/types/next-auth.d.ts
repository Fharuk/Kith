import type { DefaultSession } from "next-auth";

/**
 * Session augmentation: Kith carries role + pseudonymized identity + verification state
 * in the JWT/session so middleware and RSC guards never re-query the database.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "student" | "landlord" | "porter" | "admin";
      pseudonymizedId: string;
      isVerified: boolean;
      sessionVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: "student" | "landlord" | "porter" | "admin";
    pseudonymizedId: string;
    isVerified: boolean;
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "landlord" | "porter" | "admin";
    pseudonymizedId: string;
    isVerified: boolean;
    sessionVersion: number;
  }
}
