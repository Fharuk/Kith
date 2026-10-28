import Script from "next/script";

/**
 * Analytics, wired but inert until a domain is configured.
 *
 * Plausible is used rather than a tag manager: ~1KB, no cookies, no cross-site tracking, and
 * nothing to consent-banner in a market where that banner would cost more trust than the
 * numbers are worth. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to switch it on.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
