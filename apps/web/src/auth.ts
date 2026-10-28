import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, users, verifyPassword } from "@kith/database";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) throw new Error("Invalid input");
        const db = getDb();
        const user = (await db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())))[0]!;
        // uniform error: never reveal which factor failed
        if (!user) throw new Error("Invalid credentials");
        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) throw new Error("Account locked");
        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) {
          const fails = user.failedLogins + 1;
          await db.update(users).set({
            failedLogins: fails,
            lockedUntil: fails >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
          }).where(eq(users.id, user.id));
          throw new Error("Invalid credentials");
        }
        await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, user.id));
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          pseudonymizedId: user.pseudonymizedId,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
        token.pseudonymizedId = (user as unknown as { pseudonymizedId: string }).pseudonymizedId;
        token.isVerified = (user as unknown as { isVerified: boolean }).isVerified;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "landlord" | "porter" | "admin";
        session.user.pseudonymizedId = token.pseudonymizedId as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
});
