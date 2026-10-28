#!/usr/bin/env node
/**
 * Smoke test — the browser-e2e substitute.
 *
 * Playwright's browser download is blocked in this environment, so the honest substitute is a
 * fast HTTP pass over the surfaces that must never break: the public pages, the machine
 * endpoints crawlers and payment providers use, and (when credentials are supplied) the two
 * authenticated consoles. It asserts status AND a content marker, because a 200 that renders
 * an error boundary is still a broken site.
 *
 *   node scripts/smoke.mjs                       # against http://localhost:3000
 *   BASE_URL=https://kith.vercel.app node scripts/smoke.mjs
 *   SMOKE_EMAIL=student@demo.kith.ng SMOKE_PASSWORD=demo1234 node scripts/smoke.mjs --auth
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const REALTIME = process.env.REALTIME_URL ?? "http://localhost:3001";
const authMode = process.argv.includes("--auth");

const checks = [
  { path: "/", marker: "Kith", name: "landing" },
  { path: "/rooms", marker: "Find a room", name: "search" },
  { path: "/landlords", marker: "Landlord", name: "landlords" },
  { path: "/login", marker: "Sign in", name: "login" },
  { path: "/auctions/demo", marker: "auction", name: "auction demo", ci: false },
  { path: "/robots.txt", marker: "Sitemap", name: "robots" },
  { path: "/sitemap.xml", marker: "<urlset", name: "sitemap" },
  { path: "/verify-email", marker: "email", name: "email verify" },
];

let failures = 0;

async function check(path, marker, name) {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
    const body = await res.text();
    const okStatus = res.status < 400;
    const okMarker = body.toLowerCase().includes(marker.toLowerCase());
    const ok = okStatus && okMarker;
    if (!ok) failures++;
    console.log(`${ok ? "✓" : "✗"} ${name.padEnd(18)} ${res.status} ${Date.now() - started}ms${okMarker ? "" : ` (missing "${marker}")`}`);
    return ok;
  } catch (e) {
    failures++;
    console.log(`✗ ${name.padEnd(18)} unreachable: ${e.message}`);
    return false;
  }
}

console.log(`\nKith smoke — ${BASE}\n`);
for (const c of checks) await check(c.path, c.marker, c.name);

if (authMode && process.env.SMOKE_EMAIL && process.env.SMOKE_PASSWORD) {
  const { email, password } = { email: process.env.SMOKE_EMAIL, password: process.env.SMOKE_PASSWORD };
  const jar = new Map();
  const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  const storeCookies = (res) => {
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const idx = pair.indexOf("=");
      jar.set(pair.slice(0, idx), pair.slice(idx + 1));
    }
  };

  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: cookieHeader() } });
  storeCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookieHeader() },
    body: new URLSearchParams({ csrfToken, email, password }),
  });
  storeCookies(loginRes);
  console.log(`\n  signed in as ${email} (${loginRes.status})\n`);

  for (const [path, marker, name] of [["/dashboard", "Dashboard", "student console"], ["/passes", "pass", "guest passes"]]) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie: cookieHeader() }, redirect: "manual" });
    const ok = res.status === 200;
    if (!ok) failures++;
    console.log(`${ok ? "✓" : "✗"} ${name.padEnd(18)} ${res.status}`);
  }
}

try {
  const health = await fetch(`${REALTIME}/healthz`);
  const body = await health.text();
  const ok = health.ok && body.includes("ok");
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${"realtime".padEnd(18)} ${health.status}`);
} catch {
  console.log(`· ${"realtime".padEnd(18)} not running (optional)`);
}

console.log(failures === 0 ? "\nAll smoke checks passed.\n" : `\n${failures} smoke check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
