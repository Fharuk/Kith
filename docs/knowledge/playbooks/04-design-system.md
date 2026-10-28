# Playbook 04 — Design System: "Quiet Luxury, Nigerian Warmth"

Brief: best-in-class aesthetic; luxury/hospitality typography; **no AI-slop gradients**; brand
locked to logo (navy `#1E2D5E`, green `#4CAF50`, blue `#29ABE2`); SVG-as-code icons; webp imagery.

## Positioning the look
Airbnb-grade calm × premium Nigerian hospitality. Think editorial real-estate brochure, not SaaS
dashboard. Density low, whitespace generous, photography does the emotive work, type carries hierarchy.

## Tokens (packages/ui/tokens)
- **Ink** `#12203F` (deepened navy for text), **Navy** `#1E2D5E` (brand/surfaces), **Paper** `#FAF8F4`
  (warm off-white base — the anti-slop move: cream, not grey), **Sand** `#EFE9DF`,
  **Kith Green** `#4CAF50` (success/verified/CTA-secondary), **Kith Blue** `#29ABE2` (links, live/auction),
  **Clay** `#C67D63` (accent from V1 — warmth, used ≤5% of any screen), **Danger** `#B3261E`.
- Gradient use is **forbidden** except: the logo mark itself, and one restrained brand-mesh moment in
  the hero (green→blue, ≤2 hues, low saturation, behind photography, `prefers-reduced-motion` static).
- Elevation: 3 levels via warm-tinted shadows (`0 1px 2px rgba(18,32,63,.06), 0 12px 32px rgba(18,32,63,.08)`);
  no pure-black shadows, no glassmorphism blobs.
- Radius scale 4/8/12/16/24 — cards 16, inputs 10, pills 999. Border hairlines `1px #E4DDD1`.

## Typography (self-hosted, subsetted, `font-display: swap`)
- Display/headings: **Fraunces** (opsz axis, soft serif = hospitality/luxury, distinctive not generic).
- UI/body: **Inter** (tabular nums for prices/bids) or **Public Sans**; one family only.
- Mono for codes/passes/references: **JetBrains Mono**.
- Scale: 12/14/16/18/20/24/32/40/56/72; line-height 1.5 body, 1.1 display; letter-spacing -0.02em display.
- Prices and bid amounts always `font-variant-numeric: tabular-nums` (no layout jitter during live bids).

## Layout grammar
- 12-col grid, max-w 1200, gutters 24/32; section rhythm 96/128px; marketing pages scroll-narrative.
- Cards: photo top (4:3), tier chip, title (Fraunces 20), price row (tabular), verified badge row.
- Tier identity: Circle = blue ring + live pulse; Market = green solid chip; Elite = navy chip + gold
  hairline. Consistent everywhere (search, dashboards, emails).
- Dashboards: left rail nav (icons-as-code + labels), content max 960, tables with sticky headers.
- Porter terminal: 10-ft UI — 56px+ targets, 6-key numpad grid, high-contrast, works in sunlight.

## Iconography & media
- Icons: inline React SVG components from `packages/ui/icons` (stroke 1.5, 24px grid) — **no icon fonts,
  no <img> icons**. Generated from source SVGs, tree-shaken.
- Photography: real Nigerian student-housing context (Unsplash/Pexels search terms in
  `docs/knowledge/ASSETS.md`), ingested via `scripts/media.ts` → **webp** (q=82) + avif + blur placeholder;
  `next/image` with explicit w/h to kill CLS. Video: one muted looped hero clip (Pexels/Mixkit),
  poster-first, disabled on reduced-motion & save-data.
- Empty/loading states: illustrated line-drawings in brand ink, never grey boxes; skeletons match
  final layout exactly (CLS 0).

## Motion (see playbook 05)
- Duration 150–300ms, `cubic-bezier(.2,.8,.2,1)`; enter = fade+8px rise; nothing bounces.
- Live-auction price change: tabular-num roll + 200ms blue flash; never a full-card reflow.
- All motion behind `prefers-reduced-motion`; WebGL scenes get a static poster fallback.

## Accessibility gate (CI)
axe-core zero violations on all routes; contrast ≥ 4.5:1 (navy on paper = 13:1 ✓, green on paper
fails → green only on navy/white text); focus rings 2px blue offset 2; full keyboard path incl.
numpad terminal & auction bidding; `aria-live=polite` for bid updates; forms with inline errors +
`aria-describedby`; locale `en-NG` + `₦` formatting via Intl.
