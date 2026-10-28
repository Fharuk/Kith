import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { SkipLink } from "@/components/skip-link";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Kith — Your Verified Student Community",
    template: "%s · Kith",
  },
  description:
    "Nigeria's verified student housing community. NIMC-checked students, porter-inspected homes, and payments held in escrow until you're through the door. Launching at FUNAAB and UNILAG.",
  openGraph: {
    title: "Kith — Your Verified Student Community",
    description: "Verified students. Verified homes. Escrowed payments.",
    type: "website",
    locale: "en_NG",
    siteName: "Kith",
    images: [{ url: "/img/hero-campus.webp", width: 1600, height: 1067, alt: "A Kith-verified student residence courtyard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kith — Your Verified Student Community",
    description: "Verified students. Verified homes. Escrowed payments.",
    images: ["/img/hero-campus.webp"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1E2D5E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-dvh">
        <SkipLink />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
