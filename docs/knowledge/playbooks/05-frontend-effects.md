# Playbook 05 — Signature Effects (learned technique repos)

Sources cloned in `.cache/skills-src/`: `ruucm_shadergradient`, `dashersw_liquid-glass-js`,
`paper-design_liquid-logo`, `collidingScopes_liquid-logo`, `oso95_scroll-world`,
`pmndrs_react-three-fiber`. Rule: effects are **seasoning, never the meal** — max 3 per page,
each with a static fallback and a performance budget.

## 1. Liquid glass (dashersw/liquid-glass-js) — where: sticky nav + guest-pass card
Technique: capture a snapshot of the page into a texture, render a WebGL plane behind the UI that
refracts/displaces that snapshot through an SVG displacement map + fresnel tint (`tintOpacity`,
`borderRadius`, `type: rounded|pill|circle`). Key implementation notes from source:
- Container sizes itself from DOM (`updateSizeFromDOM` on rAF); children register as nested glass.
- Snapshot capture is the expensive part → capture once per layout change, not per frame; on
  scroll, translate the texture offset instead of re-capturing.
Kith usage: top nav (pill, tint .18) and the student **guest pass** (rounded-24) so the pass feels
like physical acrylic. Budget: ≤1 draw layer, no effect on mobile <768px (CSS `backdrop-filter`
fallback), disabled on `prefers-reduced-motion` and `navigator.deviceMemory < 4`.

## 2. Shader gradient mesh (ruucm/shadergradient) — where: hero brand moment only
Declarative R3F component rendering animated plane/sphere gradient shaders. Kith usage: one hero
backplane, 2 hues (green→blue), amplitude low, `uTime` speed 0.15, **behind** photography at 22%
opacity with a paper-colour multiply — reads as light, not as an AI gradient wash. Never on
dashboards, never as a section background, never full-saturation. SSR-safe: dynamic import,
`ssr:false`, poster gradient (static CSS) until hydrated.

## 3. Liquid logo (paper-design + collidingScopes GLSL) — where: preloader + 404 + email footer
Technique: simplex-noise fluid field in a fragment shader; logo sampled as texture with blend modes
(Normal/Multiply/Screen/Overlay) and `u_logoInteractStrength` for pointer ripples. Kith usage:
900ms brand preloader (logo melts → re-forms) and the 404. Ship as a 12KB GLSL string + one canvas;
preload only on routes that use it. Pointer ripple on hover for the footer mark.

## 4. Scroll-world (oso95/scroll-world) — where: marketing "campus flythrough"
Technique: scroll scrubs a pre-rendered camera chain; **seams must be frame-identical** (the skill's
one rule) or you get visible pops; their vanilla scrub engine is framework-agnostic.
Kith adaptation without paid video gen: build the chain from **three.js camera keyframes rendered
client-side** (isometric campus diorama: gate → hostel corridor → room → porter desk), scrubbed by
scroll with the same seam discipline (end frame of segment N === start frame N+1, identical camera
matrix + lighting). Fall back to static parallax sections if WebGL tier is low. This is our
differentiator hero: "fly through a verified Kith home".

## 5. R3F discipline (pmndrs/react-three-fiber)
- One `<Canvas>` per page max; share via context. `dpr={[1, 1.75]}`, `frameloop="demand"` when idle.
- All three.js behind `next/dynamic({ ssr:false })`; measure with `<PerformanceMonitor>` and
  downgrade to poster on sustained <30fps.
- Dispose geometries/materials on unmount; no `useFrame` allocations (GC hitches = jank = CLS of soul).

## Budgets (CI-enforced)
Hero LCP ≤ 2.5s on Moto G4 profile; effects JS ≤ 120KB gz total; zero long tasks > 200ms from WebGL
init; battery: `frameloop` pauses when tab hidden / IntersectionObserver off-screen.
