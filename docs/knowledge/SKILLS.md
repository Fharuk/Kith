# Kith Agent Skill Registry

Machine-readable index of **1310 agent skills** learned from 42 public skill repositories.

Full index: `.kith/skills/registry.jsonl` (one JSON object per skill: repo, dir, name, description, size).
Source clones for deep reading live in the (git-ignored) session cache `.cache/skills-src/`.
When a task matches a skill below, open its `SKILL.md` at `.cache/skills-src/<repo>/<dir>/SKILL.md` and follow it.

| Domain | Skills | What it covers |
|---|---|---|
| frontend-react-next | 144 | React 19 / Next.js App Router / RSC / server actions / shadcn-ui |
| design-ux-accessibility | 480 | Design systems, typography, colour, WCAG 2.2 accessibility, UI critique |
| animation-motion | 29 | Motion design, framer-motion, micro-interactions, scroll choreography, animation performance |
| data-storage | 81 | PostgreSQL schema design, Drizzle, migrations, Neon/Supabase/Mongo/Redis/Convex |
| auth-identity | 73 | Credentials/JWT/OAuth, NextAuth, Clerk, BetterAuth, 2FA/TOTP, session security |
| payments-billing | 38 | Paystack-adjacent best practice: Stripe/Dodo/Polar checkout, split payments, webhooks, idempotency, refunds, dunning |
| realtime-concurrency | 14 | WebSockets/Socket.io, queues (BullMQ), distributed locks, async correctness |
| testing-quality | 38 | Vitest, Playwright, e2e patterns, UI-breaking tests, test-driven development |
| security | 57 | Threat modelling, secure code review, secrets, injection/XSS/CSRF, crypto hygiene |
| performance | 37 | Core Web Vitals, bundle size, caching, profiling, database egress |
| devops-observability | 140 | Docker, K8s, CI/CD, Terraform, Sentry, structured logging, incident response |
| api-integrations | 56 | REST/GraphQL design, webhook verification, third-party SDK integration |
| growth-marketing | 15 | Positioning, copywriting, SEO, launch, email lifecycle, conversion |
| engineering-process | 29 | Brainstorming, planning, TDD, debugging, code review, skill authoring |
| python-backend | 7 | FastAPI/Django/Python modern practice |
| mobile | 6 | React Native / Expo |
| other | 66 | Vendor-specific (PostHog analytics, HuggingFace, Twilio, Resend, Firecrawl…) |


## frontend-react-next (144)


**PostHog**

- `auditing-warehouse-source-health` — Audit the health of a PostHog project's data warehouse sources and syncs — find every broken or degraded source connection, sync schema, and webhook c
- `building-canvases` — Create or edit a PostHog freeform canvas — a sandboxed browser application (data board, document, form, small tool, graphics experiment) stored in Pos
- `building-html-canvases` — Author a PostHog canvas with semantic HTML, CSS, and direct browser APIs — documents, articles, generative graphics, 2D canvas and WebGL experiences, 
- `building-react-quill-canvases` — Author the React + Quill implementation of a PostHog canvas: the single-component contract, the allowed imports, Quill (PostHog's design system) compo
- `debugging-surveys` — Diagnose PostHog Surveys configuration and responses across all five SDKs (web/posthog-js, iOS, Android, Flutter, React Native). Use whenever a Survey
- `diagnosing-stacktrace-symbolication` — Help users debug PostHog Error Tracking stack-trace symbolication for any supported platform — JavaScript/TypeScript web, React Native (Hermes), Andro
- `error-tracking-nextjs` — PostHog error tracking for Next.js
- `error-tracking-nextjs` — PostHog error tracking for Next.js
- `error-tracking-react` — PostHog error tracking for React
- `error-tracking-react` — PostHog error tracking for React
- `error-tracking-react-native` — PostHog error tracking for React Native
- `error-tracking-react-native` — PostHog error tracking for React Native
- `exploring-ai-failures` — Find where an AI/LLM application is failing in production and surface the failure patterns, working from real traces. Use when someone wants to unders
- `feature-flags-nextjs` — PostHog feature flags for Next.js applications
- `feature-flags-nextjs` — PostHog feature flags for Next.js applications
- `feature-flags-react` — PostHog feature flags for React applications
- `feature-flags-react` — PostHog feature flags for React applications
- `feature-flags-react-native` — PostHog feature flags for React Native applications
- `feature-flags-react-native` — PostHog feature flags for React Native applications
- `integration-nextjs-app-router` — PostHog integration for Next.js App Router applications
- `integration-nextjs-app-router` — PostHog integration for Next.js App Router applications
- `integration-nextjs-pages-router` — PostHog integration for Next.js Pages Router applications
- `integration-nextjs-pages-router` — PostHog integration for Next.js Pages Router applications
- `integration-react-native` — PostHog integration for React Native applications
- `integration-react-native` — PostHog integration for React Native applications
- `integration-react-react-router-6` — PostHog integration for React Router v6 applications
- `integration-react-react-router-6` — PostHog integration for React Router v6 applications
- `integration-react-react-router-7-data` — PostHog integration for React Router v7 - Data mode applications
- `integration-react-react-router-7-data` — PostHog integration for React Router v7 - Data mode applications
- `integration-react-react-router-7-declarative` — PostHog integration for React Router v7 - Declarative mode applications
- `integration-react-react-router-7-declarative` — PostHog integration for React Router v7 - Declarative mode applications
- `integration-react-react-router-7-framework` — PostHog integration for React Router v7 - Framework mode applications
- `integration-react-react-router-7-framework` — PostHog integration for React Router v7 - Framework mode applications
- `integration-react-tanstack-router-code-based` — PostHog integration for React applications using TanStack Router with code-based routing
- `integration-react-tanstack-router-code-based` — PostHog integration for React applications using TanStack Router with code-based routing
- `integration-react-tanstack-router-file-based` — PostHog integration for React applications using TanStack Router with file-based routing
- `integration-react-tanstack-router-file-based` — PostHog integration for React applications using TanStack Router with file-based routing
- `integration-react-vite` — PostHog integration for React applications built with Vite (no router)
- `integration-react-vite` — PostHog integration for React applications built with Vite (no router)
- `investigating-error-issue` — Investigates a single PostHog error tracking issue end-to-end. Use when the user provides an issue ID or pastes an issue URL (`/error-tracking/<id>`) 
- … +5 more (see registry.jsonl)

**Jeffallan**

- `angular-architect` — Generates Angular 17+ standalone components, configures advanced routing with lazy loading and guards, implements NgRx state management, applies RxJS 
- `java-architect` — Use when building, configuring, or debugging enterprise Java applications with Spring Boot 3.x, microservices, or reactive programming. Invoke to impl
- `laravel-specialist` — Build and configure Laravel 10+ applications, including creating Eloquent models and relationships, implementing Sanctum authentication, configuring H
- `nextjs-developer` — Use when building Next.js 14+ applications with App Router, server components, or server actions. Invoke to configure route handlers, implement middle
- `php-pro` — Use when building PHP applications with modern PHP 8.3+ features, Laravel, or Symfony frameworks. Invokes strict typing, PHPStan level 9, async patter
- `react-expert` — Use when building React 18+ applications in .jsx or .tsx files, Next.js App Router projects, or create-react-app setups. Creates components, implement
- `react-native-expert` — Builds, optimizes, and debugs cross-platform mobile applications with React Native and Expo. Implements navigation hierarchies (tabs, stacks, drawers)
- `shopify-expert` — Builds and debugs Shopify themes (.liquid files, theme.json, sections), develops custom Shopify apps (shopify.app.toml, OAuth, webhooks), and implemen
- `spring-boot-engineer` — Generates Spring Boot 3.x configurations, creates REST controllers, implements Spring Security 6 authentication flows, sets up Spring Data JPA reposit

**Callstack**

- `assess-react-native-migration` — Assesses whether and how an existing mobile product should migrate to React Native. Use when auditing one or more product repositories for migration r
- `create-react-native-library` — Scaffolds React Native libraries with create-react-native-library for standalone libraries or local native modules and views. Use when creating or wor
- `github-actions` — GitHub Actions workflow patterns for React Native iOS simulator and Android emulator cloud builds with downloadable artifacts. Use when setting up CI 
- `react-native-best-practices` — Provides React Native performance optimization guidelines for FPS, TTI, bundle size, memory leaks, re-renders, and animations. Applies to tasks involv
- `react-native-brownfield-migration` — Implements an accepted incremental brownfield migration from native iOS or Android to React Native or Expo using @callstack/react-native-brownfield. U
- `react-native-testing` — Write tests using React Native Testing Library (RNTL) v13 and v14 (`@testing-library/react-native`). Use when writing, reviewing, or fixing React Nati
- `react-native-tv-best-practices` — Reviews React Native TV apps for focus/D-pad navigation, 10-foot UI layout, TV playback/DRM integration, low-memory TV performance, and TV accessibili
- `react-navigation` — Provides React Navigation UI patterns for stacks, tabs, drawers etc. Use when building navigation UIs with React Navigation, configuring headers, bott
- `upgrading-react-native` — Upgrades React Native apps to newer versions by applying rn-diff-purge template diffs, updating package.json dependencies, migrating native iOS and An

**Clerk**

- `clerk` — Clerk authentication router. Use when user asks about Clerk CLI operations, adding authentication, setting up Clerk, custom sign-in flows, Swift or na
- `clerk-android` — Implement Clerk authentication for native Android apps using Kotlin and Jetpack Compose with clerk-android source-guided patterns. Use for prebuilt Au
- `clerk-expo` — Add Clerk authentication to Expo and React Native apps using @clerk/expo. Use for Expo setup, prebuilt native components (AuthView, UserButton), custo
- `clerk-nextjs-patterns` — Advanced Next.js patterns - middleware, Server Actions, caching with Clerk.
- `clerk-react-patterns` — React SPA auth patterns with @clerk/react for Vite/CRA - ClerkProvider setup, useAuth/useUser/useClerk hooks, React Router protected routes, custom si
- `clerk-react-router-patterns` — React Router v7/v8 patterns with Clerk — rootAuthLoader, getAuth in loaders, clerkMiddleware, protected routes, SSR user data, org switching. Triggers
- `clerk-swift` — Implement Clerk authentication UI in native Swift apps on iOS and macOS with ClerkKitUI prebuilt views or custom ClerkKit flows. Set up Clerk first wi
- `clerk-tanstack-patterns` — TanStack React Start auth patterns with @clerk/tanstack-react-start - createServerFn, beforeLoad guards, loaders, Vite plugin, server middleware. Trig

**Neon**

- `neon` — Overview of Neon, a complete set of cloud backend primitives around Lakebase Postgres: Auth, Object Storage, Functions, the AI Gateway, and Realtime. 
- `neon` — Overview of Neon, a complete set of cloud backend primitives around Lakebase Postgres: Auth, Object Storage, Functions, the AI Gateway, and Realtime. 
- `neon-functions` — Long-running, serverless Node.js HTTP functions deployed onto your Neon branch, with DATABASE_URL injected automatically and compute that runs next to
- `neon-functions` — Long-running, serverless Node.js HTTP functions deployed onto your Neon branch, with DATABASE_URL injected automatically and compute that runs next to
- `neon-postgres` — Guides and best practices for working with Lakebase Postgres on Neon: connections, pooled vs direct, schema migrations, branching, autoscaling, scale-
- `neon-postgres` — Guides and best practices for working with Lakebase Postgres on Neon: connections, pooled vs direct, schema migrations, branching, autoscaling, scale-
- `neon-realtime` — Neon Realtime makes any SQL query live. Build realtime, reactive apps and agents on Lakebase Postgres with live SQL queries and reactivity primitives.
- `neon-realtime` — Neon Realtime makes any SQL query live. Build realtime, reactive apps and agents on Lakebase Postgres with live SQL queries and reactivity primitives.

**wshobson**

- `nextjs-app-router-patterns` — Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data fetching. Use when building Next.js applications, 
- `react-modernization` — Upgrade React applications to latest versions, migrate from class components to hooks, and adopt concurrent features. Use when modernizing React codeb
- `react-native-architecture` — Build production React Native apps with Expo, navigation, native modules, offline sync, and cross-platform patterns. Use when developing mobile apps, 
- `react-native-design` — Master React Native styling, navigation, and Reanimated animations for cross-platform mobile development. Use when building React Native apps, impleme
- `react-state-management` — Master modern React state management with Redux Toolkit, Zustand, Jotai, and React Query. Use when setting up global state, managing server state, or 
- `superself` — Use when a project keeps its state in Superself (a `<!-- superself:begin` block in AGENTS.md or CLAUDE.md, or `self setup` resolves the directory to a
- `team-composition-analysis` — Design optimal team structures, hiring plans, compensation strategies, and equity allocation for early-stage startups from pre-seed through Series A. 
- `web-component-design` — Master React, Vue, and Svelte component patterns including CSS-in-JS, composition strategies, and reusable component architecture. Use when building U

**Expo**

- `eas-app-stores` — Build and submit iOS and Android apps with EAS to TestFlight, the App Store, or Google Play. Supports Expo and other React Native projects, plus exist
- `eas-observe` — Use for anything related to EAS Observe - adding `expo-observe` to an Expo project (AppMetricsRoot/ObserveRoot HOC, markInteractive and ObserveInterac
- `expo-animation` — Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread
- `expo-brownfield` — Integrate Expo and React Native into an existing native iOS or Android app. Use for brownfield, embedding a React Native screen in SwiftUI/UIKit or Ko
- `expo-data-fetching` — Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, React Query, SWR, error handling, caching, offli
- `expo-overview` — Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when
- `expo-web-to-native` — Migrate an existing web React app to a native iOS/Android app with Expo. Use when the user wants to turn a website into a mobile app, port a Next.js/V

**Next.js core**

- `next-bundle-optimizer` — Audit and reduce Next.js browser initial-load work. Use for slow route startup, oversized client bundles, duplicate browser dependencies, or features 
- `next-cache-components-adoption` — Turn on Cache Components in a Next.js app and resolve the blocking routes it surfaces. Use when the user wants to enable, adopt, or migrate to Cache C
- `next-cache-components-optimizer` — Optimize the meaningful UI available immediately from a Next.js route on an initial load (hard navigation) or named client-side navigation (soft navig
- `next-dev-loop` — Verify Next.js runtime behavior after editing app code. Use this skill to confirm a change actually works in a running app — not just that it compiles
- `next-partial-prefetching-adoption` — Turn on Partial Prefetching in a Next.js app and work through the insights it surfaces. Use when the user wants to enable or adopt Partial Prefetching
- `next-partial-prefetching-optimizer` — Optimize what selected Next.js client navigations include before the click under Partial Prefetching. Use after Cache Components and Partial Prefetchi

**Stripe**

- `stripe-apps` — Build, modify, or review Stripe Apps and extensions using the relevant documentation and reference guides. Use for custom Stripe Dashboard UI, stripe-
- `stripe-apps` — Build, modify, or review Stripe Apps and extensions using the relevant documentation and reference guides. Use for custom Stripe Dashboard UI, stripe-
- `stripe-apps` — Build, modify, or review Stripe Apps and extensions using the relevant documentation and reference guides. Use for custom Stripe Dashboard UI, stripe-
- `stripe-apps` — Build, modify, or review Stripe Apps and extensions using the relevant documentation and reference guides. Use for custom Stripe Dashboard UI, stripe-
- `stripe-apps` — Build, modify, or review Stripe Apps and extensions using the relevant documentation and reference guides. Use for custom Stripe Dashboard UI, stripe-

**Vercel Labs**

- `vercel-composition-patterns` — React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or desi
- `vercel-optimize` — Use for Vercel cost and performance optimization on deployed projects, especially Next.js, SvelteKit, Nuxt, and limited Astro apps. Collect Vercel met
- `vercel-react-best-practices` — React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React
- `vercel-react-native-skills` — React Native and Expo best practices for building performant mobile apps. Use when building React Native components, optimizing list performance, impl
- `vercel-react-view-transitions` — Guide for implementing smooth, native-feeling animations using React's View Transition API (`<ViewTransition>` component, `addTransitionType`, and CSS

**Emil Kowalski**

- `animate-expo` — Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread
- `animation-performance` — Keep web animations inside the frame budget — animate composite-only properties, keep motion off the main thread when the page is busy, and find the c
- `ask-sonner` — Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismiss
- `mobile-native` — Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed. C

**Svelte**

- `svelte-core-bestpractices` — Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte compone
- `svelte-core-bestpractices` — Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte compone
- `svelte-core-bestpractices` — Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte compone
- `svelte-core-bestpractices` — Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte compone

**TanStack**

- `tanstack-query-best-practices` — TanStack Query (React Query) best practices for data fetching, caching, mutations, and server state management. Activate when building data-driven Rea
- `tanstack-router-best-practices` — TanStack Router best practices for type-safe routing, data loading, search params, and navigation. Activate when building React applications with comp
- `tanstack-start-best-practices` — TanStack Start best practices for full-stack React applications. Server functions, middleware, SSR, authentication, and deployment patterns. Activate 

**Convex**

- `convex` — Convex is the backend agents get right on the first try: an all-TypeScript reactive platform where the database, server functions, scheduling, file st
- `convex-design` — Design and build reactive, type-safe, production-grade backends on Convex. Covers schema, queries/mutations/actions, indexes, auth, file storage, sche
- `convex-monitor` — Watch for the next dev/prod error or request in a Convex app and react to it.

**Dodo**

- `billing-sdk` — BillingSDK, the open-source React and shadcn component library for Dodo Payments billing UI. Use when building pricing tables, pricing pages, account 
- `framework-adapters` — Official @dodopayments/* framework adapters that mount Checkout, CustomerPortal, and Webhooks route handlers. Use when integrating Dodo Payments into 
- `mobile-checkout` — Dodo Payments in-app checkout for React Native, Flutter, native iOS, and Android using SFSafariViewController or Chrome Custom Tabs. Use when a mobile

**TechyMT**

- `module-organisation` — Teaches Claude Code's module organization: tools/ for capabilities, commands/ for user-facing slash commands, services/ for business logic, state/ for
- `state-management` — Use when reading or writing shared application state from a tool, task, or service. Triggered when: accessing state outside a React component, updatin

**antfu**

- `antfu-issue-triage` — Triage open issues and PRs of the current GitHub repo - find already-fixed, duplicate, and spam items, suggest labels, gauge demand from reactions and
- `vue` — Vue 3 Composition API, script setup macros, reactivity system, and built-in components. Use when writing Vue SFCs, defineProps/defineEmits/defineModel

**Firebase**

- `firebase-app-hosting-basics` — Deploys and manages full-stack web applications (Next.js, Angular) with Server-Side Rendering (SSR) using Firebase App Hosting. Use when deploying Nex
- `firebase-hosting-basics` — Deploys and configures classic Firebase Hosting for static websites, single-page apps (SPAs), and microservices. Use when deploying static sites/SPAs,

**Resend**

- `react-email` — Use when building HTML email templates with React components, adding a visual email editor to an application using the React Email visual editor, rend
- `resend-cli` — Operate the Resend platform from the terminal — send emails (including React Email .tsx templates via --react-email), manage domains, contacts, broadc

**OpenRouter**

- `create-agent-tui` — Scaffolds a complete agent TUI in TypeScript using @openrouter/agent — like create-react-app for terminal agents. Generates a customizable terminal in

**Anthropic**

- `web-artifacts-builder` — Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui

**Browserbase**

- `browser-trace` — Capture a full DevTools-protocol trace of any browser automation — CDP firehose, screenshots, and DOM dumps — then bisect the stream into per-page sea

**scroll-world**

- `scroll-world` — Build an immersive scroll-scrubbed "fly through the world" landing page for any industry or brand using Higgsfield. As the visitor scrolls, a pre-rend

**Polar**

- `polar-integration` — Add Polar billing to a TypeScript/JavaScript app using the @polar-sh/sdk package. Use this skill whenever the user wants to add a Checkout endpoint, a

**shadcn/ui**

- `migrate-radix-to-base` — Migrates React projects and components from Radix UI to Base UI. Use when asked to migrate from radix, move to base-ui, convert radix primitives, or s

**Supabase**

- `supabase` — Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); cl

**Trail of Bits**

- `let-fate-decide` — Draws the 12 Houses of the Zodiac Tarot spread to inject entropy into planning when prompts are vague, ambiguous, or casually delegated. Interprets th

**agent-browser**

- `vercel-sandbox` — Run agent-browser + Chrome inside Vercel Sandbox microVMs for browser automation from any Vercel-deployed app. Use when the user needs browser automat

## design-ux-accessibility (480)


**wshobson**

- `accessibility-compliance` — Implement WCAG 2.2 compliant interfaces with mobile accessibility, inclusive design patterns, and assistive technology support. Use when auditing acce
- `airflow-dag-patterns` — Build production Apache Airflow DAGs with best practices for operators, sensors, testing, and deployment. Use when creating data pipelines, orchestrat
- `anti-reversing-techniques` — Understand anti-reversing, obfuscation, and protection techniques encountered during software analysis. Use this skill when analyzing malware evasion 
- `api-design-principles` — Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs
- `architecture-patterns` — Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven Design. Use this skill when des
- `async-python-patterns` — Master Python asyncio, concurrent programming, and async/await patterns for high-performance applications. Use when building async APIs, concurrent sy
- `attack-tree-construction` — Build comprehensive attack trees to visualize threat paths. Use when mapping attack scenarios, identifying defense gaps, or communicating security ris
- `auth-implementation-patterns` — Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems.
- `backtesting-frameworks` — Build robust backtesting systems for trading strategies with proper handling of look-ahead bias, survivorship bias, and transaction costs. Use when de
- `bash-defensive-patterns` — Master defensive Bash programming techniques for production-grade scripts. Use when writing robust shell scripts, CI/CD pipelines, or system utilities
- `bats-testing-patterns` — Master Bash Automated Testing System (Bats) for comprehensive shell script testing. Use when writing tests for shell scripts, CI/CD pipelines, or requ
- `bazel-build-optimization` — Optimize Bazel builds for large-scale monorepos. Use when configuring Bazel, implementing remote execution, or optimizing build performance for enterp
- `before-you-build` — Pre-build product and feature risk review for founders, product managers, and AI-assisted builders. Use this skill when the user is about to build a l
- `billing-automation` — Build automated billing systems for recurring payments, invoicing, subscription lifecycle, and dunning management. Use when implementing subscription 
- `brand-landingpage` — Brand-first landing page designer — runs a brand-identity interview (colors, typography, shape language), then generates and iterates on a polished la
- `connectivity-triage` — Use this skill when debugging active macOS connectivity failures, when an API or MCP service times out or disconnects, when DNS resolution is failing 
- `cqrs-implementation` — Implement Command Query Responsibility Segregation for scalable architectures. Use when separating read and write models, optimizing query performance
- `data-quality-frameworks` — Implement data quality validation with Great Expectations, dbt tests, and data contracts. Use when building data quality pipelines, implementing valid
- `data-storytelling` — Transform data into compelling narratives using visualization, context, and persuasive structure. Use when presenting analytics to stakeholders, creat
- `dbt-transformation-patterns` — Master dbt (data build tool) for analytics engineering with model organization, testing, documentation, and incremental strategies. Use when building 
- `defi-protocol-templates` — Implement DeFi protocols with production-ready templates for staking, AMMs, governance, and flash loans. Use when building decentralized finance appli
- `deployment-pipeline-design` — Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. Use this skill when designing zero-downtime dep
- `design-system-patterns` — Build scalable design systems with design tokens, theming infrastructure, and component architecture patterns. Use when creating design tokens, implem
- `dotnet-backend-patterns` — Master C#/.NET backend development patterns for building robust APIs, MCP servers, and enterprise applications. Covers async/await, dependency injecti
- `e2e-testing-patterns` — Master end-to-end testing with Playwright and Cypress to build reliable test suites that catch bugs, improve confidence, and enable fast deployment. U
- `error-handling-patterns` — Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient app
- `eval-harness-first` — Build the evaluation harness that gates every fine-tuning run — golden sets, per-failure-mode graders, judge calibration, and base-model baselines. Us
- `event-store-design` — Design and implement event stores for event-sourced systems. Use when building event sourcing infrastructure, choosing event store technologies, or im
- `fastapi-templates` — Create production-ready FastAPI projects with async patterns, dependency injection, and comprehensive error handling. Use when building new FastAPI ap
- `gdpr-data-handling` — Implement GDPR-compliant data handling with consent management, data subject rights, and privacy by design. Use when building systems that process EU 
- `github-actions-templates` — Create production-ready GitHub Actions workflows for automated testing, building, and deploying applications. Use when setting up CI/CD with GitHub Ac
- `gitlab-ci-patterns` — Build GitLab CI/CD pipelines with multi-stage workflows, caching, and distributed runners for scalable automation. Use when implementing GitLab CI/CD,
- `gitops-workflow` — Implement GitOps workflows with ArgoCD and Flux for automated, declarative Kubernetes deployments with continuous reconciliation. Use when implementin
- `go-concurrency-patterns` — Master Go concurrency with goroutines, channels, sync primitives, and context. Use when building concurrent Go applications, implementing worker pools
- `godot-gdscript-patterns` — Master Godot 4 GDScript patterns including signals, scenes, state machines, and optimization. Use when building Godot games, implementing game systems
- `grafana-dashboards` — Create and manage production Grafana dashboards for real-time visualization of system and application metrics. Use when building monitoring dashboards
- `grpo-rlvr-training` — Train reasoning and verifiable-task behavior with GRPO and reinforcement learning from verifiable rewards (RLVR). Use when task success is algorithmic
- `helm-chart-scaffolding` — Design, organize, and manage Helm charts for templating and packaging Kubernetes applications with reusable configurations. Use when creating Helm cha
- `hermes-tweet` — Install and operate Hermes Tweet, a Hermes Agent plugin for X/Twitter research, timeline reading, tweet analysis, and approval-gated private or state-
- `hybrid-cloud-networking` — Configure secure, high-performance connectivity between on-premises infrastructure and cloud platforms using VPN and dedicated connections. Use when b
- … +60 more (see registry.jsonl)

**PostHog**

- `analyzing-funnel-correlation` — Find the events and person properties that correlate with funnel conversion or drop-off. Use when the user asks why people convert or drop off in a fu
- `authoring-scouts` — Write, edit, and adapt PostHog Signals scouts: scheduled agents that scan a project and report findings. Use to change a canonical scout's scope, thre
- `building-a-dashboard` — Build a new dashboard, or update an existing one, from a set of insights — the same job the in-app assistant does with its upsert-dashboard tool, but 
- `building-loops` — Build a Loop for PostHog Desktop: a workflow that creates an AI task each time its trigger fires, optionally followed by a Slack or email notification
- `building-workflows` — Build, edit, test, enable, and monitor PostHog workflows over MCP. Author the action/edge graph so it runs and opens cleanly in the visual editor, the
- `choosing-trend-or-slope-view` — Clarify how to visualize change over a time range before building a trend. Use whenever the user asks how much something changed, grew, dropped, impro
- `composing-grid-canvases` — Compose PostHog grid canvases — widget grids (including the user's home canvas) built from reusable component canvases. Use when a task asks to add, f
- `copying-endpoints-across-projects` — Copy a PostHog endpoint (a saved HogQL/insight query exposed as an API route) to another project in the same organization, or duplicate it under a new
- `creating-box-plot-insights` — Creates product analytics or SQL-backed box plot insights in PostHog. Use when a user asks to create, build, or save a box plot, visualize a numeric d
- `creating-experiments` — Guides agents through experiment creation: reading the project's setup with experiment-setup-context, defining the hypothesis, configuring rollout and
- `creating-replay-vision-scanners` — Guides agents through creating and safely sizing a Replay Vision scanner: choosing the scanner type (monitor/classifier/scorer/summarizer), shaping th
- `creating-surveys` — Creates and launches PostHog surveys through MCP, including NPS/CSAT popovers, hosted feedback forms, and headless surveys. Guides survey type selecti
- `designing-email-templates` — Author, save, and edit email templates in the PostHog workflows library — compose email design JSON with Liquid personalization and create and round-t
- `designing-replay-vision-scanners` — Designs a Replay Vision scanner that produces trustworthy observations: one visible question per scanner, a type chosen from the answer shape, a query
- `diagnosing-failed-warehouse-syncs` — Diagnose why a data warehouse sync is failing and recommend the right recovery action. Use when the user asks "why isn't my Stripe/Postgres/Hubspot sy
- `error-tracking-nuxt` — PostHog error tracking for Nuxt
- `error-tracking-nuxt` — PostHog error tracking for Nuxt
- `exploring-autocapture-events` — Guides exploration of $autocapture events captured by posthog-js to understand user interactions, find CSS selectors (especially data-attr attributes)
- `exploring-live-traffic` — Inspects PostHog Web analytics Live tab data — current users online, last-30-minutes pageviews, top pages, referrers, devices, browsers, countries, bo
- `exploring-llm-costs` — Investigate LLM spend in PostHog — total cost over time, cost by model, provider, user, trace, or custom dimension, token and cache-hit economics, and
- `exploring-mcp-tool-original-user-motive` — Build a starting-point taxonomy for an MCP tool — what users were trying to accomplish before they reached the tool — and publish it as a PostHog note
- `exploring-replay-vision-observations` — Guides agents through pulling a Replay Vision scanner's observations, reading the findings, and acting on them — summarizing patterns across sessions,
- `exploring-scouts` — How to explore and make sense of PostHog Signals scouts — the scheduled agents that scan a project and write reports into the Signals inbox. Use when 
- `finding-sessions-to-watch` — Guides a user from "I want to watch recordings but don't know which ones" to a short, high-signal list of sessions worth watching. Use when the user a
- `implementing-api-surveys` — Implements a PostHog API (headless) survey inside the user's own codebase so it renders with their UI components and captures the exact events PostHog
- `integration-nuxt-3.6` — PostHog integration for Nuxt versions 3.0 to 3.6
- `integration-nuxt-3.6` — PostHog integration for Nuxt versions 3.0 to 3.6
- `integration-nuxt-4` — PostHog integration for Nuxt 4 applications
- `integration-nuxt-4` — PostHog integration for Nuxt 4 applications
- `investigating-ci-failures` — Investigates a specific CI failure to a verdict: whose fault, which commit, who wrote it, and whether it's fixed. Use for "who broke master", "why did
- `linking-errors-to-traces` — Links a PostHog error occurrence or session's errors to OpenTelemetry traces, logs with the same trace ID, and Session Replay. Use when the user asks 
- `managing-experiment-lifecycle` — Guides experiment state transitions: launching, pausing, resuming, freezing/unfreezing exposure, ending, shipping variants, archiving, resetting, dupl
- `managing-path-cleaning-rules` — Inspects URL paths and proposes, tests, orders, and applies project-level path cleaning rules so dynamic segments (numeric IDs, UUIDs, slugs, dates) c
- `modeling-activation-metrics` — Build reusable activation models — an activation-rate metric and a per-user/per-account activated flag — on either PostHog data-warehouse views (HogQL
- `modeling-conversion-metrics` — Build reusable conversion models — funnel/step conversion rates, drop-off, and time-to-convert — on either PostHog data-warehouse views (HogQL) or an 
- `modeling-dimension-tables` — Build reusable dimension / lookup tables for a star schema — country/region, timezone, currency, date, plan/product, and other descriptive attributes 
- `modeling-product-usage-metrics` — Build reusable product-usage and engagement models — retention, stickiness, and lifecycle — on either PostHog data-warehouse views (HogQL) or an exter
- `modeling-revenue-metrics` — Build reusable revenue models — MRR, ARR, gross revenue, new/expansion/contraction/churn, ARPU, LTV, and per-customer/per-account revenue — on either 
- `modeling-warehouse-foundations` — Shared foundations for building reusable data models in PostHog, on either of two stacks: PostHog-native data-warehouse views / materialized views (Ho
- `monthly-to-annual` — Build the case for converting a PostHog monthly/PAYG customer to an annual prepaid credit plan. Pulls 12-24 months of invoice history from the data wa
- … +9 more (see registry.jsonl)

**Jeffallan**

- `api-designer` — Use when designing REST or GraphQL APIs, creating OpenAPI specifications, or planning API architecture. Invoke for resource modeling, versioning strat
- `architecture-designer` — Use when designing new high-level system architecture, reviewing existing designs, or making architectural decisions. Invoke to create architecture di
- `chaos-engineer` — Designs chaos experiments, creates failure injection frameworks, and facilitates game day exercises for distributed systems — producing runbooks, expe
- `cli-developer` — Use when building CLI tools, implementing argument parsing, or adding interactive prompts. Invoke for parsing flags and subcommands, displaying progre
- `cloud-architect` — Designs cloud architectures, creates migration plans, generates cost optimization recommendations, and produces disaster recovery strategies across AW
- `code-documenter` — Generates, formats, and validates technical documentation — including docstrings, OpenAPI/Swagger specs, JSDoc annotations, doc portals, and user guid
- `cpp-pro` — Writes, optimizes, and debugs C++ applications using modern C++20/23 features, template metaprogramming, and high-performance systems techniques. Use 
- `csharp-developer` — Use when building C# applications with .NET 8+, ASP.NET Core APIs, or Blazor web apps. Builds REST APIs using minimal or controller-based routing, con
- `database-optimizer` — Optimizes database queries and improves performance across PostgreSQL and MySQL systems. Use when investigating slow queries, analyzing execution plan
- `django-expert` — Use when building Django web applications or REST APIs with Django REST Framework. Invoke when working with settings.py, models.py, manage.py, or any 
- `dotnet-core-expert` — Use when building .NET 8 applications with minimal APIs, clean architecture, or cloud-native microservices. Invoke for Entity Framework Core, CQRS wit
- `fastapi-expert` — Use when building high-performance async Python APIs with FastAPI and Pydantic V2. Invoke to create REST endpoints, define Pydantic models, implement 
- `feature-forge` — Conducts structured requirements workshops to produce feature specifications, user stories, EARS-format functional requirements, acceptance criteria, 
- `flutter-expert` — Use when building cross-platform applications with Flutter 3+ and Dart. Invoke for widget development, Riverpod/Bloc state management, GoRouter naviga
- `fullstack-guardian` — Builds security-focused full-stack web applications by implementing integrated frontend and backend components with layered security at every level. C
- `game-developer` — Use when building game systems, implementing Unity/Unreal Engine features, or optimizing game performance. Invoke to implement ECS architecture, confi
- `golang-pro` — Implements concurrent Go patterns using goroutines and channels, designs and builds microservices with gRPC or REST, optimizes Go application performa
- `graphql-architect` — Use when designing GraphQL schemas, implementing Apollo Federation, or building real-time subscriptions. Invoke for schema design, resolvers with Data
- `javascript-pro` — Writes, debugs, and refactors JavaScript code using modern ES2023+ features, async/await patterns, ESM module systems, and Node.js APIs. Use when buil
- `kotlin-specialist` — Provides idiomatic Kotlin implementation patterns including coroutine concurrency, Flow stream handling, multiplatform architecture, Compose UI constr
- `legacy-modernizer` — Designs incremental migration strategies, identifies service boundaries, produces dependency maps and migration roadmaps, and generates API facade des
- `mcp-developer` — Use when building, debugging, or extending MCP servers or clients that connect AI systems with external tools and data sources. Invoke to implement to
- `microservices-architect` — Designs distributed system architectures, decomposes monoliths into bounded-context services, recommends communication patterns, and produces service 
- `ml-pipeline` — Designs and implements production-grade ML pipeline infrastructure: configures experiment tracking with MLflow or Weights & Biases, creates Kubeflow o
- `nestjs-expert` — Creates and configures NestJS modules, controllers, services, DTOs, guards, and interceptors for enterprise-grade TypeScript backend applications. Use
- `playwright-expert` — Use when writing E2E tests with Playwright, setting up test infrastructure, or debugging flaky browser tests. Invoke to write test scripts, create pag
- `prompt-engineer` — Writes, refactors, and evaluates prompts for LLMs — generating optimized prompt templates, structured output schemas, evaluation rubrics, and test sui
- `python-pro` — Use when building Python 3.11+ applications requiring type safety, async programming, or robust error handling. Generates type-annotated Python code, 
- `rag-architect` — Designs and implements production-grade RAG systems by chunking documents, generating embeddings, configuring vector stores, building hybrid search pi
- `rails-expert` — Rails 7+ specialist that optimizes Active Record queries with includes/eager_load, implements Turbo Frames and Turbo Streams for partial page updates,
- `rust-engineer` — Writes, reviews, and debugs idiomatic Rust code with memory safety and zero-cost abstractions. Implements ownership patterns, manages lifetimes, desig
- `salesforce-developer` — Writes and debugs Apex code, builds Lightning Web Components, optimizes SOQL queries, implements triggers, batch jobs, platform events, and integratio
- `secure-code-guardian` — Use when implementing authentication/authorization, securing user input, or preventing OWASP Top 10 vulnerabilities — including custom security implem
- `security-reviewer` — Identifies security vulnerabilities, generates structured audit reports with severity ratings, and provides actionable remediation guidance. Use when 
- `spark-engineer` — Use when writing Spark jobs, debugging performance issues, or configuring cluster settings for Apache Spark applications, distributed data processing 
- `sql-pro` — Optimizes SQL queries, designs database schemas, and troubleshoots performance issues. Use when a user asks why their query is slow, needs help writin
- `sre-engineer` — Defines service level objectives, creates error budget policies, designs incident response procedures, develops capacity models, and produces monitori
- `swift-expert` — Builds iOS/macOS/watchOS/tvOS applications, implements SwiftUI views and state management, designs protocol-oriented architectures, handles async/awai
- `test-master` — Generates test files, creates mocking strategies, analyzes code coverage, designs test architectures, and produces test plans and defect reports acros
- `typescript-pro` — Implements advanced TypeScript type systems, creates custom type guards, utility types, and branded types, and configures tRPC for end-to-end type saf
- … +4 more (see registry.jsonl)

**Twilio**

- `twilio-ai-agent-architect` — Planning skill for AI-powered conversational agents. Qualifies the developer's use case across outcome sophistication, entry point, and customer profi
- `twilio-compliance-onboarding` — Registrations required BEFORE Twilio traffic works. Covers messaging programs (A2P 10DLC, toll-free verification, WhatsApp WABA, RCS, short code, alph
- `twilio-compliance-traffic` — Rules you must follow for Twilio messaging and voice traffic. Covers TCPA (consent tiers, quiet hours, DNC), GDPR (EU consent, right to deletion), PCI
- `twilio-conference-calls` — Build multi-party calls using Twilio Conference. Covers warm transfer, cold transfer, coaching (whisper), hold vs mute, participant modes, and supervi
- `twilio-content-template-builder` — Create, manage, and send message templates using Twilio's Content API. Covers template creation for WhatsApp, SMS, RCS, and MMS; variable usage; Whats
- `twilio-conversation-intelligence` — Twilio Conversation Intelligence development guide. Use when building real-time or post-call conversation analysis, language operator pipelines, senti
- `twilio-conversations-classic-api` — Build multi-channel messaging experiences using Twilio Conversations (classic) API. Covers creating conversations, adding participants (SMS, WhatsApp,
- `twilio-customer-support-architect` — Planning skill for building customer service and support systems. Qualifies the developer's needs across the support ladder (self-service → AI agents 
- `twilio-email-send` — Use when the caller has Twilio credentials (Account SID + Auth Token or API Key SID + Secret) and needs to send email via comms.twilio.com/v1/Emails. 
- `twilio-iam-auth-setup` — Set up and manage Twilio authentication credentials: Auth Tokens, API keys (Standard, Main, Restricted), Access Tokens for client-side SDKs, and crede
- `twilio-isv-sms-best-practices` — Best practices for ISVs (Independent Software Vendors) building SMS features into multi-tenant SaaS platforms using Twilio. Covers customer onboarding
- `twilio-messaging-channel-advisor` — Planning skill that helps the developer pick the right Twilio messaging channel — SMS, MMS, RCS, or WhatsApp — for a given use case. Qualifies intent 
- `twilio-messaging-overview` — Twilio Messaging channel overview and onboarding guide. Covers all channels (SMS, WhatsApp, RCS, Facebook Messenger), the unified Messages API, channe
- `twilio-migrate-messaging-to-verify` — Migrate an existing OTP / one-time-passcode flow from the Twilio Programmable Messaging API (self-built: generate code → send SMS → validate) to the T
- `twilio-notifications-alerts-advisor` — Planning skill for transactional notifications, alerts, and reminders. Qualifies the developer's needs across urgency, channel selection, delivery con
- `twilio-numbers-senders` — Choose the right Twilio number type and sender BEFORE building. Covers phone numbers (local, toll-free, short code, mobile), alphanumeric sender IDs, 
- `twilio-rcs-messaging` — Send RCS Business Messages via Twilio. Covers compliance onboarding (7-part US process), sender profile setup, sending rich cards and carousels, SMS f
- `twilio-regulatory-compliance-bundles` — Manage regulatory compliance for international phone numbers. Covers what bundles are, which countries require them, how to create End-Users and Suppo
- `twilio-reliability-patterns` — Handle rate limits, retries, and failures when building on Twilio at scale. Covers 429 exponential backoff with jitter, per-number throughput limits, 
- `twilio-security-compliance-hipaa` — Configure Twilio accounts for HIPAA compliance. Covers BAA requirements, HIPAA Project designation (self-service and support), eligible services list,
- `twilio-security-hardening` — Secure Twilio applications against common attacks. Covers credential management (API keys vs auth tokens), request validation (webhook signature verif
- `twilio-send-message` — Send messages via Twilio's Programmable Messaging API across all channels — SMS, MMS, RCS, and WhatsApp. Covers text messages, media, rich content (ca
- `twilio-sendgrid-email-settings` — Configure SendGrid dynamic templates (Handlebars), tracking settings (opens, clicks, subscriptions), link branding for custom tracking domains, and co
- `twilio-sendgrid-engagement-quality` — Monitor email program health with SendGrid Engagement Quality (SEQ) scores. Covers the SEQ API endpoints, the 5 scoring metrics (engagement recency, o
- `twilio-sendgrid-inbound-parse` — Receive inbound email via SendGrid Inbound Parse webhook. Covers MX record setup, parsed vs raw mode, handling attachments, and common pitfalls. Use w
- `twilio-sendgrid-suppressions` — Manage SendGrid email suppressions: bounces, blocks, spam reports, invalid emails, global unsubscribes, and ASM suppression groups. Covers when and ho
- `twilio-sendgrid-webhooks` — Track email delivery and engagement via SendGrid Event Webhooks. Covers all 11 event types (delivery + engagement), webhook handler implementation, EC
- `twilio-studio-flows` — Build and deploy Twilio Studio flows — visual IVR, SMS/WhatsApp, and conversation automation — by authoring the flow definition JSON and managing it t
- `twilio-voice-conversation-relay` — Build AI-powered voice agents using Twilio ConversationRelay. Handles real-time speech recognition (ASR), text-to-speech (TTS), and bidirectional audi
- `twilio-voice-twiml` — Build voice call logic using TwiML (Twilio Markup Language). Covers the core verbs (Say, Play, Gather, Dial, Record, Conference), generating TwiML wit
- `twilio-webhook-architecture` — Design, secure, and operate Twilio webhook endpoints. Covers inbound event handling, status callbacks, signature validation, connection overrides for 
- `twilio-whatsapp-send-message` — WhatsApp messaging deep-dive reference. Covers the 24-hour service window rules (free-form vs template mode), sandbox setup for testing, template appr

**Trail of Bits**

- `address-sanitizer` — Builds and runs code under AddressSanitizer to catch buffer overflows, use-after-free, and other memory errors during fuzzing or tests. Covers -fsanit
- `aflpp` — Sets up and runs AFL++ for multi-core fuzzing of C/C++ projects built with afl-clang-fast or afl-gcc-fast. Covers instrumentation modes, parallel main
- `atheris` — Sets up and runs Atheris, the coverage-guided Python fuzzer built on libFuzzer. Covers TestOneInput harnesses, FuzzedDataProvider, instrumenting both 
- `audit-context-building` — Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when start
- `audit-prep-assistant` — Prepares codebases for security review using Trail of Bits' checklist. Helps set review goals, runs static analysis tools, increases test coverage, re
- `burpsuite-project-parser` — Searches and explores Burp Suite project files (.burp) from the command line. Use when searching response headers or bodies with regex patterns, extra
- `cargo-fuzz` — Sets up and runs cargo-fuzz, the standard fuzzing tool for Cargo-based Rust projects. Covers cargo fuzz init, the nightly toolchain requirement, fuzz_
- `codeql` — Scans a codebase for security vulnerabilities using CodeQL's interprocedural data flow and taint tracking analysis. Triggers on "run codeql", "codeql 
- `fuzzing-dictionary` — Builds and applies fuzzing dictionaries so a fuzzer can produce the keywords, magic bytes, and tokens a target expects. Covers extracting tokens from 
- `fuzzing-obstacles` — Patches past the barriers that stop a fuzzer making progress — checksum and hash verification, magic-value validation, time-based seeds, and other non
- `guidelines-advisor` — Smart contract development advisor based on Trail of Bits' best practices. Analyzes codebase to generate documentation/specifications, review architec
- `harness-writing` — Designs and improves fuzzing harnesses for C/C++ and Rust. Covers mapping raw bytes onto a target API, generating structured inputs, avoiding non-dete
- `libafl` — Builds custom fuzzers with LibAFL, the modular Rust fuzzing library. Covers composing observers, feedbacks, mutators, schedulers, and executors into a
- `libfuzzer` — Sets up and runs libFuzzer, the coverage-guided fuzzer built into LLVM, on C/C++ code that compiles with Clang. Covers harness structure, -fsanitize=f
- `modern-cpp` — Guides C++ code toward modern idioms (C++20/23/26). Use when writing new C++ code, modernizing legacy patterns, or working on security-critical C++. R
- `mutation-testing` — Configures mewt or muton campaigns, analyzes surviving mutants, and investigates bugs exposed by testing gaps. Use when setting up mutation testing, r
- `ossfuzz` — Enrolls a project in OSS-Fuzz, Google's free continuous fuzzing service for open source, and drives it locally. Covers project.yaml, Dockerfile and bu
- `property-based-testing` — Writes, reviews, and debugs property-based tests — Hypothesis, fast-check, proptest, jqwik, rapid, and Echidna or Medusa for Solidity invariants. Use 
- `reproduce-regression` — Use when deploying before/after systems and building a live-system PoC for a regression candidate.
- `ruzzy` — Sets up and runs Ruzzy, Trail of Bits' coverage-guided Ruby fuzzer and the only production-ready one for the language. Covers harness structure, fuzzi
- `secure-workflow-guide` — Guides through Trail of Bits' 5-step secure development workflow. Runs Slither scans, checks special features (upgradeability/ERC conformance/token in
- `semgrep-rule-creator` — Creates custom Semgrep rules for detecting security vulnerabilities, bug patterns, and code patterns. Use when writing Semgrep rules or building custo
- `sharp-edges` — Identifies error-prone APIs, dangerous configurations, and footgun designs that enable security mistakes. Use when reviewing API designs, configuratio
- `spec-to-code-compliance` — Check code against the documentation that specifies it - which requirements hold, which the code contradicts, which are absent, and what the code does
- `testing-handbook-generator` — Generates Claude Code skills from the Trail of Bits Testing Handbook (appsec.guide), analyzing handbook pages and emitting SKILL.md files with the str
- `trailmark` — Builds and queries multi-language source and binary code graphs for security analysis. Includes pre-analysis passes for blast radius, taint propagatio
- `trailmark-structural` — Runs full Trailmark structural analysis by building a graph, running `preanalysis()`, and reporting hotspots, taint, blast radius, privilege boundarie
- `trailmark-summary` — Runs a Trailmark summary analysis on a codebase. Returns auto-detected languages, entry point count, and dependency list. Use when vivisect or galvani
- `vector-forge` — Mutation-driven test vector generation. Finds implementations of a cryptographic algorithm or protocol, runs mutation testing to identify escaped muta
- `writing-lean-proofs` — Writes and reviews structured Lean 4 proofs and designs Lean libraries following Mathlib conventions. Use when proving theorems in Lean, formalizing m
- `yara-rule-authoring` — Guides authoring of high-quality YARA-X detection rules for malware identification. Use when writing, reviewing, or optimizing YARA rules. Covers nami

**Stripe**

- `connect-recommend` — Use this skill when the user asks about Stripe Connect configuration, charge patterns, Dashboard access, or how to get started with Connect, is buildi
- `connect-recommend` — Use this skill when the user asks about Stripe Connect configuration, charge patterns, Dashboard access, or how to get started with Connect, is buildi
- `connect-recommend` — Use this skill when the user asks about Stripe Connect configuration, charge patterns, Dashboard access, or how to get started with Connect, is buildi
- `connect-recommend` — Use this skill when the user asks about Stripe Connect configuration, charge patterns, Dashboard access, or how to get started with Connect, is buildi
- `connect-recommend` — Use this skill when the user asks about Stripe Connect configuration, charge patterns, Dashboard access, or how to get started with Connect, is buildi
- `connect-required-verification-information` — Use this skill when the user asks what information a Stripe Connect connected account must provide for verification, onboarding, KYC, or account requi
- `connect-required-verification-information` — Use this skill when the user asks what information a Stripe Connect connected account must provide for verification, onboarding, KYC, or account requi
- `connect-required-verification-information` — Use this skill when the user asks what information a Stripe Connect connected account must provide for verification, onboarding, KYC, or account requi
- `connect-required-verification-information` — Use this skill when the user asks what information a Stripe Connect connected account must provide for verification, onboarding, KYC, or account requi
- `connect-required-verification-information` — Use this skill when the user asks what information a Stripe Connect connected account must provide for verification, onboarding, KYC, or account requi
- `metronome` — Guides Metronome usage-based billing integration decisions — event ingestion (single and batch, idempotency, billable metrics), contract design (rate 
- `metronome` — Guides Metronome usage-based billing integration decisions — event ingestion (single and batch, idempotency, billable metrics), contract design (rate 
- `metronome` — Guides Metronome usage-based billing integration decisions — event ingestion (single and batch, idempotency, billable metrics), contract design (rate 
- `metronome` — Guides Metronome usage-based billing integration decisions — event ingestion (single and batch, idempotency, billable metrics), contract design (rate 
- `metronome` — Guides Metronome usage-based billing integration decisions — event ingestion (single and batch, idempotency, billable metrics), contract design (rate 
- `stripe-best-practices` — Guides Stripe integration decisions across development and test environment planning (separate sandboxes vs the shared test mode sandbox), API selecti
- `stripe-best-practices` — Guides Stripe integration decisions across development and test environment planning (separate sandboxes vs the shared test mode sandbox), API selecti
- `stripe-best-practices` — Guides Stripe integration decisions across development and test environment planning (separate sandboxes vs the shared test mode sandbox), API selecti
- `stripe-best-practices` — Guides Stripe integration decisions across development and test environment planning (separate sandboxes vs the shared test mode sandbox), API selecti
- `stripe-best-practices` — Guides Stripe integration decisions across development and test environment planning (separate sandboxes vs the shared test mode sandbox), API selecti
- `stripe-directory` — Identifies external providers, merchants, nonprofits, platforms, APIs, and software services, and resolves the documented way to engage them — to pay,
- `stripe-directory` — Identifies external providers, merchants, nonprofits, platforms, APIs, and software services, and resolves the documented way to engage them — to pay,
- `stripe-directory` — Identifies external providers, merchants, nonprofits, platforms, APIs, and software services, and resolves the documented way to engage them — to pay,
- `stripe-directory` — Identifies external providers, merchants, nonprofits, platforms, APIs, and software services, and resolves the documented way to engage them — to pay,
- `stripe-directory` — Identifies external providers, merchants, nonprofits, platforms, APIs, and software services, and resolves the documented way to engage them — to pay,
- `upgrade-stripe` — Guide for upgrading Stripe API versions, webhook endpoints, server-side SDKs, Stripe.js, and mobile SDKs
- `upgrade-stripe` — Guide for upgrading Stripe API versions, webhook endpoints, server-side SDKs, Stripe.js, and mobile SDKs
- `upgrade-stripe` — Guide for upgrading Stripe API versions, webhook endpoints, server-side SDKs, Stripe.js, and mobile SDKs
- `upgrade-stripe` — Guide for upgrading Stripe API versions, webhook endpoints, server-side SDKs, Stripe.js, and mobile SDKs
- `upgrade-stripe` — Guide for upgrading Stripe API versions, webhook endpoints, server-side SDKs, Stripe.js, and mobile SDKs

**Corey Haines**

- `ab-testing` — When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program. Also use when the user mention
- `ai-seo` — When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions '
- `churn-prevention` — When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also us
- `co-marketing` — When the user wants to find co-marketing partners, plan joint campaigns, or brainstorm partnership opportunities. Use when the user says 'co-marketing
- `cold-email` — Write and run B2B cold outbound that gets replies, from cold emails and follow-ups to sending setup, LinkedIn, multichannel cadences, and reply handli
- `community-marketing` — Build and leverage online communities to drive product growth and brand loyalty. Use when the user wants to create a community strategy, grow a Discor
- `conversion-tracking` — Set up, audit, verify, or fix website conversion tracking. Use when the conversion is a form submission, booked meeting, chat, phone call, signup, or 
- `customer-research` — When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to cus
- `free-tools` — When the user wants to plan, evaluate, or build a free tool for marketing purposes — lead generation, SEO value, or brand awareness. Also use when the
- `image` — When the user wants to create, generate, edit, or optimize images for marketing — blog heroes, social graphics, product mockups, profile banners, list
- `influencer-marketing` — When the user wants to run influencer, creator, or ambassador partnerships to promote their product — finding and vetting partners, structuring deals,
- `link-building` — When the user wants to earn backlinks or third-party mentions that lift rankings and AI citations. Also use when the user mentions 'link building,' 'l
- `marketing-plan` — When the user needs a comprehensive marketing plan for a client, a company they advise, or their own product. Also use when the user mentions "marketi
- `offers` — When the user wants to design, construct, or improve an offer — the thing they actually sell — including value framing, bonus stacking, guarantee desi
- `product-marketing` — When the user wants to create or update their product marketing context document. Also use when the user mentions 'product context,' 'marketing contex
- `programmatic-seo` — When the user wants to create SEO-driven pages at scale using templates and data. Also use when the user mentions "programmatic SEO," "template pages,
- `prospecting` — When the user wants to find, qualify, and build a list of prospects to reach out to, across B2B SaaS, general B2B, or local small businesses. Also use
- `seo-audit` — When the user wants to audit, review, or diagnose SEO issues on their site. Also use when the user mentions "SEO audit," "technical SEO," "why am I no
- `site-architecture` — When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the use
- `sms` — When the user wants to plan, build, or optimize SMS, MMS, or WhatsApp marketing — including welcome flows, abandoned cart texts, post-purchase, win-ba
- `social` — When the user wants help creating, scheduling, or optimizing social media content for LinkedIn, Twitter/X, Instagram, TikTok, or Facebook, or wants to

**MongoDB**

- `mongodb-atlas-stream-processing` — Manages MongoDB Atlas Stream Processing (ASP) workflows. Handles workspace provisioning, data source/sink connections, processor lifecycle operations,
- `mongodb-atlas-stream-processing` — Manages MongoDB Atlas Stream Processing (ASP) workflows. Handles workspace provisioning, data source/sink connections, processor lifecycle operations,
- `mongodb-atlas-stream-processing` — Manages MongoDB Atlas Stream Processing (ASP) workflows. Handles workspace provisioning, data source/sink connections, processor lifecycle operations,
- `mongodb-connection` — Optimize MongoDB client connection configuration (pools, timeouts, patterns) for any supported driver language. Use this skill when working/updating/r
- `mongodb-connection` — Optimize MongoDB client connection configuration (pools, timeouts, patterns) for any supported driver language. Use this skill when working/updating/r
- `mongodb-connection` — Optimize MongoDB client connection configuration (pools, timeouts, patterns) for any supported driver language. Use this skill when working/updating/r
- `mongodb-mcp-setup` — Guide users through configuring key MongoDB MCP server options. Use this skill when a user has the MongoDB MCP server installed but hasn't configured 
- `mongodb-mcp-setup` — Guide users through configuring key MongoDB MCP server options. Use this skill when a user has the MongoDB MCP server installed but hasn't configured 
- `mongodb-natural-language-querying` — Generate read-only MongoDB queries (find) or aggregation pipelines using natural language, with collection schema context and sample documents. Use th
- `mongodb-natural-language-querying` — Generate read-only MongoDB queries (find) or aggregation pipelines using natural language, with collection schema context and sample documents. Use th
- `mongodb-natural-language-querying` — Generate read-only MongoDB queries (find) or aggregation pipelines using natural language, with collection schema context and sample documents. Use th
- `mongodb-schema-design` — MongoDB schema design patterns and anti-patterns. Use when designing data models, reviewing schemas, migrating from SQL, or troubleshooting performanc
- `mongodb-schema-design` — MongoDB schema design patterns and anti-patterns. Use when designing data models, reviewing schemas, migrating from SQL, or troubleshooting performanc
- `mongodb-schema-design` — MongoDB schema design patterns and anti-patterns. Use when designing data models, reviewing schemas, migrating from SQL, or troubleshooting performanc
- `mongodb-search-and-ai` — Covers everything about search in MongoDB: Atlas Search (full-text), Vector Search (semantic), and Hybrid Search. Use this skill for ANY question abou
- `mongodb-search-and-ai` — Covers everything about search in MongoDB: Atlas Search (full-text), Vector Search (semantic), and Hybrid Search. Use this skill for ANY question abou
- `mongodb-search-and-ai` — Covers everything about search in MongoDB: Atlas Search (full-text), Vector Search (semantic), and Hybrid Search. Use this skill for ANY question abou

**Redis**

- `redis-clustering` — Redis Cluster and replication guidance covering hash tags for multi-key operations, avoiding CROSSSLOT errors, and reading from replicas to scale read
- `redis-clustering` — Redis Cluster and replication guidance covering hash tags for multi-key operations, avoiding CROSSSLOT errors, and reading from replicas to scale read
- `redis-connections` — Redis client and connection guidance covering connection pooling, multiplexing, pipelining, client-side caching with RESP3, avoiding slow commands (KE
- `redis-connections` — Redis client and connection guidance covering connection pooling, multiplexing, pipelining, client-side caching with RESP3, avoiding slow commands (KE
- `redis-core` — Core Redis modeling guidance — choose the right data structure (String, Hash, List, Set, Sorted Set, JSON, Stream, Vector Set) and use consistent colo
- `redis-core` — Core Redis modeling guidance — choose the right data structure (String, Hash, List, Set, Sorted Set, JSON, Stream, Vector Set) and use consistent colo
- `redis-observability` — Redis observability guidance — which metrics to monitor (memory, connections, hit ratio, ops/sec, rejected connections), which built-in commands to re
- `redis-observability` — Redis observability guidance — which metrics to monitor (memory, connections, hit ratio, ops/sec, rejected connections), which built-in commands to re
- `redis-search` — Redis Search guidance covering FT.CREATE schema design, field type selection (TEXT, TAG, NUMERIC, GEO, GEOSHAPE, VECTOR, JSON path), DIALECT 2 query s
- `redis-search` — Redis Search guidance covering FT.CREATE schema design, field type selection (TEXT, TAG, NUMERIC, GEO, GEOSHAPE, VECTOR, JSON path), DIALECT 2 query s
- `redis-security` — Redis security guidance covering authentication (requirepass and ACL users), TLS, ACL-based least-privilege access control, restricting network exposu
- `redis-security` — Redis security guidance covering authentication (requirepass and ACL users), TLS, ACL-based least-privilege access control, restricting network exposu
- `redis-semantic-cache` — Redis LangCache guidance for semantic caching of LLM responses on Redis Cloud — calling search/set via the SDK or REST API, tuning the similarity thre
- `redis-semantic-cache` — Redis LangCache guidance for semantic caching of LLM responses on Redis Cloud — calling search/set via the SDK or REST API, tuning the similarity thre

**UI/UX Pro Max**

- `banner-design` — Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with optional generated or supplied v
- `banner-design` — Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with optional generated or supplied v
- `brand` — Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets
- `brand` — Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets
- `design` — Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini, Atlas Cloud, or MuAPI AI), corporate identi
- `design` — Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini, Atlas Cloud, or MuAPI AI), corporate identi
- `design-system` — Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typograp
- `design-system` — Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typograp
- `slides` — Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
- `slides` — Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
- `ui-styling` — Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-
- `ui-styling` — Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-
- `ui-ux-pro-max` — UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including

**Expo**

- `eas-hosting` — Deploy Expo websites and Expo Router API routes to EAS Hosting - export the web bundle, run eas deploy for production and PR preview URLs, manage envi
- `eas-simulator` — Run and control a user's app on a remote iOS/Android simulator hosted on EAS cloud. Read before running any `eas simulator:*` commands - it has the cu
- `eas-update` — Configure and use EAS Update for over-the-air JavaScript and asset updates with expo-updates and EAS CLI. Use when setting up OTA updates, running eas
- `eas-update-insights` — Check the health of published EAS Update: crash rates, install/launch counts, unique users, payload size, and the split between embedded and OTA users
- `eas-workflows` — Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS con
- `expo-design-system` — Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusab
- `expo-dev-client` — Build and distribute Expo development clients locally or via TestFlight for internal testing. For production TestFlight releases and store submission,
- `expo-module` — Guide for creating and writing Expo native modules and views using the Expo Modules API (Swift, Kotlin, TypeScript). Covers module definition DSL, nat
- `expo-native-ui` — Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, visual effects, gradients
- `expo-ui` — Build native UI with the @expo/ui package: real SwiftUI on iOS and Jetpack Compose on Android. Default to @expo/ui for sheets (BottomSheet), pickers, 
- `expo-upgrade` — Guidelines for upgrading Expo SDK versions and fixing dependency issues

**Emil Kowalski**

- `animate` — Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, wh
- `animation-vocabulary` — Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term ("the bouncy thing when a popover opens
- `apple-design` — Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring anim
- `break-ui` — Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, 
- `emil-design-eng` — This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel g
- `find-animation-opportunities` — Search a codebase or UI for places that don't animate but should, and reject everything that shouldn't. Read-only; it proposes motion with exact value
- `pick-ui-library` — Pick the right library for a given frontend task from a curated, opinionated list — numbers, OTP inputs, charts, command menus, virtualization, drag a
- `prototype` — Build multiple genuinely different versions of a UI piece you describe, rendered behind a visual picker so you can flip through them live and promote 
- `review-animations` — Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. Default to flagging; approval i
- `write-swift` — How to write modern Swift well — modeling with value types, Swift 6 data-race safety and approachable concurrency (@concurrent, main-actor-by-default,

**Anthropic**

- `academy-guide` — Stop and check this skill before finishing any reply to a question about how to use Claude or a Claude product — it recommends matching courses, tutor
- `brand-guidelines` — Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when b
- `canvas-design` — Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece
- `doc-coauthoring` — Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, deci
- `frontend-design` — Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and
- `mcp-builder` — Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. 
- `theme-factory` — Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with
- `webapp-testing` — Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, ca

**Browserbase**

- `autobrowse` — Self-improving browser automation via the auto-research loop. Iteratively runs a browsing task, reads the trace, and improves the navigation skill (st
- `browser-to-api` — Turn a website's observable HTTP traffic into a best-effort OpenAPI 3.1 spec by analyzing a `browser-trace` capture. Use when the user wants to discov
- `company-research` — Company discovery and deep research skill. Researches a company's product and ICP, discovers target companies to sell to using Browserbase Search API,
- `competitor-analysis` — Competitor research and intelligence skill. Takes a user's company (with optional seed competitor URLs), auto-discovers additional competitors via Bro
- `event-prospecting` — Event prospecting skill. Takes a conference / event speakers URL, extracts the people, filters their companies against the user's ICP, then deep-resea
- `optimize-agent-prompt` — Builds and improves Browserbase Agent API demos through an Autobrowse-style outer loop: run a fixed task, collect Agent messages and session logs, sco
- `safe-browser` — Build local constrained-browser agents with a safe_browser tool that owns CDP, enforces a domain allowlist with Fetch interception, and lets a runtime
- `ui-test` — AI-powered adversarial UI testing via the browse CLI. Analyzes git diffs to test only what changed, or explores the full app to find bugs. Tests funct

**HuggingFace**

- `hf-cloud-sagemaker-iam-preflight` — Ensure a usable SageMaker execution role exists before deploying or training. Use this skill whenever about to create a SageMaker endpoint, model, tra
- `hf-mem` — Hugging Face CLI to estimate the required memory to load Safetensors or GGUF model weights for inference from the Hugging Face Hub
- `huggingface-gradio` — Build Gradio web UIs and demos in Python. Use when creating or editing Gradio apps, components, event listeners, layouts, or chatbots.
- `huggingface-llm-trainer` — Train or fine-tune language and vision models using TRL (Transformer Reinforcement Learning) or Unsloth with Hugging Face Jobs infrastructure. Covers 
- `huggingface-lora-space-builder` — Build and publish a Gradio demo on Hugging Face Spaces for a user-provided LoRA. Use when someone asks to create, generate, ship, or publish a Space, 
- `huggingface-spaces` — Build, deploy, and maintain applications on Hugging Face Spaces — Gradio / Docker / Static SDKs, ZeroGPU and dedicated hardware, model loading, debugg
- `huggingface-tool-builder` — Use this skill when the user wants to build tool/scripts or achieve a task where using data from the Hugging Face API would help. This is especially u
- `huggingface-zerogpu` — AI demos and GPU compute with Gradio Spaces and Hugging Face Spaces ZeroGPU. Use when writing or reviewing code that uses `@spaces.GPU`, configuring `

**agent-browser**

- `agent-browser` — Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, 
- `agentcore` — Run agent-browser on AWS Bedrock AgentCore cloud browsers. Use when the user wants to use AgentCore, run browser automation on AWS, use a cloud browse
- `core` — Core agent-browser usage guide. Read this before running any agent-browser commands. Covers the snapshot-and-ref workflow, navigating pages, interacti
- `derive-client` — Reverse-engineer a website's internal API by recording browser traffic into a HAR file, then generate a standalone client or CLI that calls the endpoi
- `dogfood` — Systematically explore and test a web application to find bugs, UX issues, and other problems. Use when asked to "dogfood", "QA", "exploratory test", 
- `electron` — Automate Electron desktop apps (VS Code, Slack, Discord, Figma, Notion, Spotify, etc.) using agent-browser via Chrome DevTools Protocol. Use when the 
- `slack` — Interact with Slack workspaces using browser automation. Use when the user needs to check unread channels, navigate Slack, send messages, extract data
- `webmcp-gen` — Build and validate experimental WebMCP tools for an existing web page. Use when an agent needs to expose a site's real workflows as page tools, create

**TechyMT**

- `build-tool-factory` — Teaches how to create a new Claude Code tool using the buildTool() factory from src/Tool.ts. Use this whenever adding a new capability to Claude Code 
- `creating-skills` — Use when extracting an engineering pattern from a codebase and packaging it as a skill for an AI assistant. Triggered when: converting a recurring cod
- `domain-model` — Teaches Claude Code's core domain model: Tool, Message, Task, ToolUseContext, AppState, and Command — the six concepts every part of the system is bui
- `hot-paths` — Teaches Claude Code's startup and runtime performance patterns: lazySchema() for deferred Zod parsing, feature() flags for build-time dead code elimin
- `task-system` — Teaches Claude Code's Task system: background work spawned from tools or commands, typed by TaskType (local_bash, local_agent, remote_agent, in_proces
- `tool-definition` — Teaches the complete pattern for defining a Claude Code Tool: schema-first design with Zod, the buildTool factory for safe defaults, checkPermissions 
- `types-and-interfaces` — Teaches Claude Code's type design: discriminated unions for output data shapes, Zod schemas as the single source of truth for tool inputs, DeepImmutab

**Firecrawl**

- `firecrawl-agent` — Autonomously navigate websites and extract structured data across pages. Use when the task requires navigation or no suitable ready-made workflow or d
- `firecrawl-deep-research` — Produce an intensive, cited analytical report: executive summary, multi-angle findings, contrarian views, open questions, and full sources. Use only w
- `firecrawl-demo-walkthrough` — Walk through a product's key flows with Firecrawl browser and produce a structured UX/product walkthrough. Use for signup, onboarding, pricing, docs, 
- `firecrawl-interact` — Drive a live browser on a scraped page: click, fill forms, log in, paginate, infinite-scroll. Use when content requires interaction or a scrape failed
- `firecrawl-knowledge-base` — Build a knowledge base from web content with Firecrawl. Use for local reference docs, RAG-ready chunks, fine-tuning datasets, documentation mirrors, t
- `firecrawl-website-design-clone` — Extract an existing website's visual system into DESIGN.md, or collect its existing logo, colors, fonts and homepage messaging for a document. Use for
- `firecrawl-workflows` — Run focused Firecrawl workflows for research, documentation lookup, SEO audits, QA, lead discovery and enrichment, business contacts, current jobs, fa

**Superpowers**

- `brainstorming` — You MUST use this before any creative work - creating features, building components, adding functionality, modifying behavior, or planning anything ne
- `diagnosing-superpowers` — Use when a superpowers session went wrong and your human partner wants to know why — repeated work, ignored plans, stumbles, poor results, a skill tha
- `receiving-code-review` — Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires 
- `requesting-code-review` — Use when completing tasks, implementing major features, or before merging to verify work meets requirements
- `using-superpowers` — Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying quest
- `verification-before-completion` — Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming
- `writing-plans` — Use when you have a spec or requirements for a multi-step task, before touching code

**OpenRouter**

- `create-headless-agent` — Scaffolds a headless agent in TypeScript using @openrouter/agent and Bun — for CLI tools, API servers, queue workers, and pipelines. No terminal UI. U
- `openrouter-agent-migration` — Migration guide from @openrouter/sdk to @openrouter/agent for callModel, tool(), stop conditions, and agent features. This skill should be used when c
- `openrouter-analytics-query` — Construct and execute analytics queries against the OpenRouter API — full parameter reference for metrics, dimensions, filters, time ranges, ordering,
- `openrouter-benchmarks` — Query OpenRouter's Benchmarks API for model benchmark rankings and scores. Use when the user asks for benchmark-backed model selection, model rankings
- `openrouter-decisions` — Implement decision models through OpenRouter's Decisions API, which returns probabilities instead of generated text: pick the primitive per judgment, 
- `openrouter-oauth` — Implement "Sign In with OpenRouter" using OAuth PKCE — framework-agnostic, no SDK or client registration required. Use when the user wants to add Open

**Docker**

- `docker-agent-config` — Use this skill when creating or editing an agent.yaml (or .yml/.hcl) configuration file for Docker Agent (cagent), including defining agents, models/p
- `docker-build-strategies` — Use this skill when writing, reviewing, or optimizing Dockerfiles, even if the user just says their image is too large, their build is slow, or they n
- `docker-destructive-guardrails` — Use this skill before running, or recommending, any Docker command that deletes, wipes, resets, or otherwise irreversibly changes state — even if the 
- `docker-docs` — Use this skill to answer questions about any Docker product from current official Docker documentation instead of memory, even if the user just asks "
- `docker-sandboxes-kits` — Use this skill when authoring, validating, packaging, signing, or composing a Docker Sandboxes kit `spec.yaml` (`sbx kit add/inspect/pack/pull/push/si
- `docker-sandboxes-lifecycle` — Use this skill when creating, running, reattaching to, listing, stopping, or removing Docker Sandboxes (the standalone `sbx` CLI that runs AI coding a

**antfu**

- `antfu-create-pr` — Create a reviewable GitHub pull request from the current branch with a Conventional Commits title, a concise evidence-based body, and before/after scr
- `nitro` — Nitro is the framework-agnostic server toolkit (powering Nuxt) for building and deploying web servers anywhere. Use when working with nitro.config, se
- `nuxt` — Nuxt full-stack Vue framework with SSR, auto-imports, and file-based routing. Use when working with Nuxt apps, server routes, useFetch, middleware, or
- `vite` — Vite build tool configuration, plugin API, SSR, and Vite 8 Rolldown migration. Use when working with Vite projects, vite.config.ts, Vite plugins, or b
- `vitepress` — VitePress static site generator powered by Vite and Vue. Use when building documentation sites, configuring themes, or writing Markdown with Vue compo

**Clerk**

- `clerk-custom-ui` — Custom authentication flows and component appearance - hooks (useSignIn, useSignUp), themes, colors, fonts, CSS. Use for custom sign-in/sign-up flows,
- `clerk-nuxt-patterns` — Nuxt 3 auth patterns with @clerk/nuxt - middleware, composables, server API routes, SSR. Triggers on: Nuxt auth, useAuth composable, clerkMiddleware N
- `clerk-setup` — Set up Clerk authentication in any project with the Clerk CLI and official framework quickstarts. Use when adding Clerk, initializing Clerk, scaffoldi
- `clerk-vue-patterns` — Vue 3 patterns with Clerk — composables (useAuth, useUser, useClerk, useOrganization), Vue Router guards, Pinia auth store integration. Triggers on: v
- `clerk-webhooks` — Clerk webhooks for real-time events and data syncing. Verify with verifyWebhook from the framework-specific package. Handle user, session, organizatio

**Convex**

- `convex-add` — Add a capability to the CURRENT Convex app — consults the served Convex capability catalog for always-current procedures (billing, crons, auth, agent,
- `convex-authz` — Audit and harden a Convex app's authorization: identity-from-arg impersonation, missing per-document ownership checks, public queries leaking data by 
- `convex-create-component` — Builds reusable Convex components with isolated tables and app-facing APIs. Use for new components, reusable backend modules, integrations, or compone
- `convex-improve-convex-plugin` — Send this coding session's transcript to the Convex team for an AI post-mortem that improves the quickstart system. Run only when the user explicitly 
- `convex-quickstart` — Get a barebones Convex + web template running from a one-sentence idea.

**Dodo**

- `checkout-integration` — Dodo Payments checkout via hosted Checkout Sessions (client.checkoutSessions.create), static payment links, and overlay or inline checkout for one-tim
- `license-keys` — Dodo Payments license keys for software products, covering activation, validation, and deactivation via client.licenses, activation limits, expiry, en
- `product-catalog-management` — Dodo Payments product catalog management, covering products with one_time_price, recurring_price, or usage_based_price, add-ons, product collections, 
- `refunds-and-disputes` — Dodo Payments refunds and disputes, covering full and partial refunds, refund statuses, dispute and chargeback lifecycle events, evidence, and revokin

**Firebase**

- `firebase-auth-basics` — Guide for setting up and using Firebase Authentication. Use this skill when the user's app requires user sign-in, user management, or secure data acce
- `firebase-crashlytics` — Comprehensive guide for Firebase Crashlytics, including provisioning and SDK usage. Use this skill when the user needs help setting up Crashlytics, ad
- `firebase-data-connect` — Builds and deploys Firebase SQL Connect (aka Firebase Data Connect) backends with PostgreSQL securely. Use when designing schemas with tables and rela
- `firestore-rules-creation` — Designs, authors, refactors, and hardens production-grade Cloud Firestore Security Rules (firestore.rules). IMPORTANT: If subagent delegation AND the 

**Neon**

- `neon-ai-gateway` — One API and one credential for frontier and open-source LLMs and embedding models, built into your Neon branch and powered by Databricks. Use when a u
- `neon-ai-gateway` — One API and one credential for frontier and open-source LLMs and embedding models, built into your Neon branch and powered by Databricks. Use when a u
- `neon-auth` — Add authentication to a new app. Use for "add auth", "add login", Neon Auth (Managed Better Auth), identity routing, sign-up, sign-in, password reset,
- `neon-auth` — Add authentication to a new app. Use for "add auth", "add login", Neon Auth (Managed Better Auth), identity routing, sign-up, sign-in, password reset,

**Callstack**

- `agent-device` — Automates interactions for Apple-platform apps (iOS, tvOS, macOS) and Android devices. Use when navigating apps, taking snapshots/screenshots, tapping
- `dogfood` — Systematically explore and test a mobile app on iOS/Android with agent-device to find bugs, UX issues, and other problems. Use when asked to "dogfood"
- `writing-user-docs` — House style for user-facing documentation — voice, scope, structure, and what to leave out. Use this skill whenever writing, editing, or reviewing any

**Polar**

- `polar-migration` — Guide for migrating to Polar from other payment platforms (Stripe Billing, Paddle, Lemon Squeezy). Use this skill when: (1) Planning a migration from 
- `polar-testing` — Guide for testing Polar payment integrations using the sandbox environment. Use this skill when: (1) Setting up the Polar sandbox for development; (2)
- `setup-polar` — Interactive onboarding wizard to set up Polar payment integration from scratch. Use this skill when: (1) User wants to "set up Polar" or "integrate Po

**Resend**

- `agent-email-inbox` — Use when building any system where email content triggers actions — AI agent inboxes, automated support handlers, email-to-task pipelines, or any work
- `email-best-practices` — Use when building email features, emails going to spam, high bounce rates, setting up SPF/DKIM/DMARC authentication, implementing email capture, ensur

**Vercel Labs**

- `web-design-guidelines` — Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "chec
- `writing-guidelines` — Review docs/prose for Writing Guidelines compliance. Use when asked to "review my docs", "check writing style", "audit prose", "review docs voice and 

**Astro**

- `astro` — Skill for building with the Astro web framework. Helps create Astro components and pages, configure SSR adapters, set up content collections, deploy s

**BetterAuth**

- `create-auth` — Scaffold and implement authentication in TypeScript/JavaScript apps using Better Auth. Detect frameworks, configure database adapters, set up route ha

**Remotion**

- `remotion-saas` — Build an app with Remotion

**shadcn/ui**

- `shadcn` — Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI, including chat interfaces. Provides project 

**Supabase**

- `supabase-postgres-best-practices` — Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Pos

**Svelte**

- `writing-opencode-plugins` — OpenCode plugins, @opencode-ai/plugin, @opencode-ai/plugin/tui, plugin hooks, custom tools, TUI routes, slots, keymaps, and packaging. Use when creati

## animation-motion (29)


**Remotion**

- `remotion-best-practices` — Router for all Remotion skills
- `remotion-captions` — Transcribing, displaying and animating captions
- `remotion-create` — Create a new Remotion video
- `remotion-docs` — Search Remotion documentation
- `remotion-interactivity` — Structure Remotion markup for interactivity
- `remotion-maps` — Remotion Map animation knowledge
- `remotion-markup` — Content, animation and effects best practices
- `remotion-multimedia` — Interacting with Mediabunny
- `remotion-render` — Export a Remotion video
- `remotion-studio` — Preview a Remotion video
- `remotion-upgrade` — Upgrade Remotion, and related packages

**PostHog**

- `account-handover` — Draft structured handover notes for transitioning a PostHog account from one TAM or CSM to another. Use this skill when a TAM needs to hand over an ac
- `assessing-heatmaps` — Assesses what a page's heatmap is telling you and recommends concrete changes. Pulls click / rageclick / scroll-depth data for a URL, names the hot el
- `integration-astro-view-transitions` — PostHog integration for Astro with ClientRouter view transitions
- `integration-astro-view-transitions` — PostHog integration for Astro with ClientRouter view transitions
- `posthog-pls-transition-leads` — Qualify and draft outreach for PostHog product-led leads who are hitting a billing transition — either startup program customers rolling off free cred

**Corey Haines**

- `ad-creative` — When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertisi
- `popups` — When the user wants to create or optimize popups, modals, overlays, slide-ins, or banners for conversion purposes. Also use when the user mentions "ex
- `video` — When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks. Also use when the user mentions 'video pr

**wshobson**

- `checkpoint-promotion` — Gate fine-tuned checkpoints with drift budgets, paired comparison, and forgetting checks before promotion. Use after a training run produces a checkpo
- `on-call-handoff-patterns` — Master on-call shift handoffs with context transfer, escalation procedures, and documentation. Use this skill when transitioning on-call responsibilit
- `quantized-export` — Export a promoted fine-tuned model in the right deployment format — merged safetensors, LoRA-only, GGUF with imatrix, or FP8. Use after a checkpoint p

**Redis**

- `iris-development` — Iris is Redis's umbrella for AI-focused products. Use this skill when integrating with the Iris Redis Agent Memory (RAM) data plane on Redis Cloud — r
- `iris-development` — Iris is Redis's umbrella for AI-focused products. Use this skill when integrating with the Iris Redis Agent Memory (RAM) data plane on Redis Cloud — r

**OpenRouter**

- `openrouter-video` — Generate videos from text prompts (and optional reference or frame images) using OpenRouter's asynchronous video generation API. Use when the user ask

**Anthropic**

- `slack-gif-creator` — Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users

**Dodo**

- `discounts-and-promotions` — Dodo Payments discount codes and promotional pricing, covering discount CRUD, percentage and flat amounts, eligibility rules, usage limits, stacking v

**Emil Kowalski**

- `improve-animations` — Survey a codebase's animation and motion code as a senior motion advisor, then produce a prioritized audit and self-contained implementation plans for

**Twilio**

- `twilio-marketing-promotions-advisor` — Planning skill for marketing and promotional messaging. Use when a developer is figuring out how to set up or architect a marketing campaign on Twilio

## data-storage (81)


**Convex**

- `convex-advisor` — Read the Convex deployment's 72h insights (read limits, OCC contention), root-cause each event in code, report evidence-backed perf/cost findings with
- `convex-agent` — Add an AI agent / RAG backend (@convex-dev/agent) to the Convex app.
- `convex-auth` — Add authentication (passkeys/OAuth) to the current Convex app, including the auth.config.ts wiring.
- `convex-backup` — Set up Convex backups and run a restore DRILL that proves recovery — snapshot, restore into a throwaway preview, assert the data came back — plus a sc
- `convex-billing` — Add Stripe billing/payments to the Convex app via @convex-dev/stripe (checkout + webhook + gating).
- `convex-cost` — Preview Convex spend — rank functions by bytes/documents-read × call-volume from insights, project each cost driver's growth curve, name the cheapest 
- `convex-crons` — Add recurring scheduled jobs (crons) to the Convex app.
- `convex-deploy-guard` — Classify + announce the target Convex deployment before any deployment-affecting command; fresh explicit consent for prod actions; session read-only m
- `convex-docs` — Pull version-current Convex docs for the version this project uses — pin the installed version, fetch page-as-markdown or check node_modules types, fr
- `convex-domains` — Point a domain you already own at your Convex app (DNS records, custom-domain attach, auth-origin rebind).
- `convex-env` — Set and wire Convex deployment env vars / secrets for the app.
- `convex-expert` — Convex backend specialist. Use this agent for any code inside a `convex/` directory — function definitions, schemas, indexes, queries, mutations, acti
- `convex-explain-app` — Explain an existing Convex app — data model + relationships, public vs internal functions, auth/ownership model, components, a request→data flow — rea
- `convex-insights` — Query a running Convex app's logs + health in natural language (official MCP): failures, slow/expensive functions, deploy causality — scoped, evidence
- `convex-launch-readiness` — Run every Convex audit (authz, reviewer, advisor, insights) into one scored, deduped readiness report with an ordered fix plan — Lighthouse for your b
- `convex-migrate` — Migrate schema + backfill data on a deployed Convex app using @convex-dev/migrations.
- `convex-migrate-rehearse` — Rehearse a live-app schema change + backfill on a snapshot-seeded preview deployment, verify, then promote the proven change to prod with the snapshot
- `convex-optimize` — Audit and optimize an existing Convex app: security, scale, upgrades, observability.
- `convex-reviewer` — Convex code reviewer — security, auth, validators, performance, and pattern checks for code in a convex/ directory. Use to review or audit Convex func
- `convex-seed` — Seed or import data into the Convex database.
- `convex-self-heal` — Production error → triaged, root-caused, repaired, and certified (tsc + rehearsal + reproduce-then-gone) fix PR for a human to merge — then confirm th
- `convex-sentinel` — Set up Sentinel production error capture in your own Convex deployment.
- `convex-suggest` — Suggest the matching Convex component when the user hand-rolls a pattern it already solves (crons, sharded-counter, rate-limiter, storage, search, pre
- `convex-test` — Generate convex-test tests for the app's Convex functions.
- `convex-verify` — Prove a Convex feature works — seed, drive as multiple mocked users via convex-test, assert behavior including the negative authz cases (wrong user re

**PostHog**

- `adding-warehouse-person-properties` — Sync columns from a synced data warehouse table onto PostHog person or group properties, so warehouse data becomes usable anywhere person and group pr
- `analyzing-task-runs` — Split a completed PostHog task run into activity records — what the agent tried, whether it worked, what blocked it — and record each one through the 
- `authoring-data-quality-checks` — Adds and runs data quality checks (dbt-test style assertions) on a project's warehouse tables and saved-query views, and HogQL catalog metrics: not-nu
- `debugging-experiments` — Debug and support PostHog Experiments (A/B tests) for a customer looking at their own results. Use whenever an experiment support ticket is pasted or 
- `diagnosing-experiment-health` — Runs diagnostics and a health check on one PostHog experiment: its setup, exposures, results and changes during the run. Covers 0 exposures, sample ra
- `exploring-apm-traces` — Investigates distributed application performance using PostHog APM (OpenTelemetry span) data via MCP. Use when the user asks about service traces, slo
- `exploring-llm-traces` — Debug and inspect LLM/AI agent traces using PostHog's MCP tools. Use when the user pastes a trace or session URL (e.g. /ai-observability/traces/<id> o
- `formatting-insight-axes` — Pick the right y-axis unit when creating or updating an insight via `posthog:insight-create` or `posthog:insight-update` — both TrendsQuery (`trendsFi
- `investigating-logs` — Investigate logs in a PostHog project: verify a service or deployment is healthy, explain an error spike, triage an incident, or understand what a log
- `investigating-replay` — Investigates a session recording by gathering metadata, person profile, same-session events, and linked error tracking issues in one pass. Use when a 
- `querying-posthog-data` — Explains how to query PostHog data, defaulting to typed runners for supported product analytics. Read it before you write HogQL/SQL. Also read it befo
- `setting-up-warehouse-properties` — Populate person or group properties from a data warehouse table or materialized view, so warehouse columns become properties usable in feature flags, 
- `signals-scout-data-warehouse` — Signals scout for warehouse imports. Watches external data sources, sync schemas, webhook push channels, and materialized views for failures, silent s
- `tuning-incremental-sync-config` — Change the sync configuration of an existing data warehouse schema — switch sync_type, pick a different incremental_field, set primary_key_columns, ch
- `turning-engineering-analytics-into-insights` — Converts engineering analytics (PR / CI) data into saved PostHog insights, dashboards, and subscriptions, and explains how to query the product data d

**MongoDB**

- `mongodb-qe-size-estimation` — Estimates the storage and memory impact of encrypting fields in collections with Queryable Encryption (QE) enabled. Do NOT use for collections that us
- `mongodb-qe-size-estimation` — Estimates the storage and memory impact of encrypting fields in collections with Queryable Encryption (QE) enabled. Do NOT use for collections that us
- `mongodb-qe-size-estimation` — Estimates the storage and memory impact of encrypting fields in collections with Queryable Encryption (QE) enabled. Do NOT use for collections that us
- `mongodb-query-optimizer` — Help with MongoDB query optimization and indexing. Use only when the user asks for optimization or performance: "How do I optimize this query?", "How 
- `mongodb-query-optimizer` — Help with MongoDB query optimization and indexing. Use only when the user asks for optimization or performance: "How do I optimize this query?", "How 
- `mongodb-query-optimizer` — Help with MongoDB query optimization and indexing. Use only when the user asks for optimization or performance: "How do I optimize this query?", "How 

**Neon**

- `neon-object-storage` — S3-compatible object storage that branches with your database, so each branch gets its own copy of the files and the rows that point at them. Use when
- `neon-object-storage` — S3-compatible object storage that branches with your database, so each branch gets its own copy of the files and the rows that point at them. Use when
- `neon-postgres-branches` — Choose and create the right Neon branch type for testing and development. Use when users ask about Neon branching, migration testing with real data, i
- `neon-postgres-branches` — Choose and create the right Neon branch type for testing and development. Use when users ask about Neon branching, migration testing with real data, i
- `neon-postgres-egress-optimizer` — Diagnose and fix excessive Postgres egress (network data transfer) in a codebase. Use when a user mentions high database bills, unexpected data transf
- `neon-postgres-egress-optimizer` — Diagnose and fix excessive Postgres egress (network data transfer) in a codebase. Use when a user mentions high database bills, unexpected data transf

**Stripe**

- `stripe-projects` — Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add 
- `stripe-projects` — Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add 
- `stripe-projects` — Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add 
- `stripe-projects` — Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add 
- `stripe-projects` — Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add 

**Docker**

- `docker-compose-patterns` — Use this skill when creating, modifying, or debugging Docker Compose configurations, even if the user just says they need to wire services together, a
- `docker-project-foundations` — Use this skill when setting up, initializing, or Dockerizing a project, even if the user doesn't explicitly mention Docker but describes a need for co
- `docker-sandboxes-env` — Use this skill when authoring, planning, or running a declarative `sbxenv.yaml` file for Docker Sandboxes (`sbx env create/run/plan/exec/rm`), even if

**Expo**

- `expo-dom` — Use Expo DOM components to run web code in a webview on native and as-is on web. Migrate web code to native incrementally. For the end-to-end migratio
- `expo-examples` — Expo's official example projects - the expo/examples repo of ~70 `with-*` integrations (Stripe, Clerk, Supabase, OpenAI, maps, Reanimated, SQLite, Ski
- `expo-migrate-module` — Migrate an existing Apple/Swift Expo native module from the Expo Modules API 1.0 definition DSL to the 2.0 macro API (sometimes called v2) while prese

**wshobson**

- `angular-migration` — Migrate from AngularJS to Angular using hybrid mode, incremental component rewriting, and dependency injection updates. Use when upgrading AngularJS a
- `database-migration` — Execute database migrations across ORMs and platforms with zero-downtime strategies, data transformation, and rollback procedures. Use when migrating 
- `evaluation-methodology` — PluginEval quality methodology, covering dimensions, rubrics, and scoring formulas. Use this skill when understanding how plugin quality is measured, 

**Jeffallan**

- `code-reviewer` — Analyzes code diffs and files to identify bugs, security vulnerabilities (SQL injection, XSS, insecure deserialization), code smells, N+1 queries, nam
- `postgres-pro` — Use when optimizing PostgreSQL queries, configuring replication, or implementing advanced database features. Invoke for EXPLAIN analysis, JSONB operat

**Anthropic**

- `claude-api` — Reference for the Claude API / Anthropic SDK — model ids, pricing, params, streaming, tool use, MCP, agents, caching, token counting, model migration.
- `xlsx` — Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an ex

**Corey Haines**

- `revops` — When the user wants help with revenue operations, lead lifecycle management, or marketing-to-sales handoff processes. Also use when the user mentions 
- `schema` — When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "struct

**Firebase**

- `firebase-firestore` — Sets up, manages, queries, and configures Cloud Firestore databases (Standard/Enterprise edition), including data modeling, security rules, indexes, a
- `firebase-security-rules-auditor` — Audits Firebase (Firestore, Cloud Storage) security rules for vulnerabilities, privilege escalation, role bypasses, create vs update inconsistencies, 

**OpenRouter**

- `openrouter-analytics-schema` — Discover the OpenRouter analytics schema — available metrics, dimensions, filter operators, and granularities. Use when you need to know what analytic

**BetterAuth**

- `better-auth-best-practices` — Configure Better Auth server and client, set up database adapters, manage sessions, add plugins, and handle environment variables. Use when users ment

**Browserbase**

- `add-webmcp` — Analyze an existing web application, identify safe user-visible capabilities across routes, forms, server actions, handlers, and schemas, then impleme

**Clerk**

- `clerk-backend-api` — Clerk Backend REST API explorer and executor. Browse tags, inspect endpoint schemas, and execute authenticated requests. Use when listing users, manag

**Dodo**

- `webhook-integration` — Dodo Payments webhook handling, covering endpoint setup, Standard Webhooks signature verification on the raw body, payment, subscription, and refund e

**Firecrawl**

- `firecrawl-lead-gen` — Find and qualify new prospects with Firecrawl Alexandria people and company data: people by role, seniority, company, industry, size, location or tech

**Trail of Bits**

- `firebase-apk-scanner` — Scans Android APKs for Firebase security misconfigurations including open databases, storage buckets, authentication issues, and exposed cloud functio

## auth-identity (73)


**PostHog**

- `analyzing-experiment-session-replays` — Analyze session replay patterns across experiment variants to understand user behavior differences. Use when the user wants to see how users interact 
- `authoring-error-tracking-alerts` — Author error tracking alerts that fire when an issue is created, reopened, or starts spiking. Use when the user asks to set up error notifications, ro
- `authoring-log-alerts` — Author useful, low-noise log alerts on services in a PostHog project. Use when the user asks to set up alerts for their logs, suggest alerts they shou
- `cleaning-up-stale-feature-flags` — Identify stale feature flags in a PostHog project and clean up the code that checks them. Use when the user wants to find, audit, or remove unused, fu
- `consuming-endpoints-from-client-code` — Wire a PostHog endpoint into a client app or SDK. Covers fetching the OpenAPI spec, generating a typed client with openapi-generator or @hey-api/opena
- `creating-online-evaluations` — Author continuously-running online evaluations in PostHog AI observability, grounded in real failure modes you've identified. Use when the user wants 
- `diagnosing-ci-and-merge-bottlenecks` — Diagnoses CI and pull-request pipeline health for a GitHub repo using the engineering analytics MCP tools — pull-requests (PR list with CI status), wo
- `diagnosing-missing-recordings` — Diagnoses why a session recording is missing or was not captured. Use when a user asks why a session has no replay, why recordings aren't appearing, o
- `downloading-batch-export-files` — Export PostHog events, persons, sessions, or the results of a HogQL query on demand and download the resulting files. Use when the user asks to downlo
- `exploring-mcp-sessions` — Investigate individual PostHog MCP sessions — the sequence of tool calls a single agent made in one run, what it was trying to do, and where it went w
- `feature-usage-feed` — Set up an LLM-judge evaluation that extracts canonical use cases for a PostHog feature at scale and streams the results to a Slack channel as a live f
- `finding-replay-for-issue` — Finds the most informative session recording linked to an error tracking issue. Use when a user has an error tracking issue ID and wants to watch a re
- `installing-posthog-in-a-codebase` — Install and configure a PostHog SDK in a repository you can read and edit, following PostHog's docs for the framework. Use when a user working in thei
- `resolving-ingestion-warnings` — Diagnoses and resolves PostHog ingestion warnings — problems recorded while ingesting events (dropped events, rejected person merges, oversized payloa
- `review-hog-authoring` — How to author custom PostHog Review skills: the review perspectives, blind-spot checks, validation criteria, and resolution criteria that drive PostHo
- `review-hog-resolution-criteria-gaps` — Fixes should-fix and must-fix bugs and missing functionality. Leaves wording, documentation, and style suggestions to the author.
- `scanning-experiments-with-replay-vision` — Provisions a Replay Vision `experiment` scanner, which watches one experiment's exposed sessions, records each session's variant, samples the variants
- `signals-scout-session-replay` — Signals scout for PostHog session replay. Watches that sessions keep recording (capture cliffs) and surfaces friction inside recordings — rage/dead-cl
- `signals-scout-skills-store` — Skill-hygiene scout for the team's PostHog skills store. Watches recently-changed and most- used skills for authoring violations — vague descriptions,
- `signals-scout-tasks` — Signals scout for PostHog Tasks. Watches delivery health — failing runs clustered by repository and error class, retry storms — and, on a slower rotat
- `signals-scout-web-analytics` — Signals scout for PostHog web traffic. Watches per-channel session volume, attribution breakage, and landing-page health (bounce and 404 steps) agains
- `suggesting-path-cleaning-rules` — Runs and reasons about the automated AI health check that suggests path-cleaning rules for web-analytics teams. Use when asked to generate path-cleani
- `working-with-scouts` — Work with PostHog Signals scouts: scheduled agents that monitor a project and write reports into the Signals inbox. Use to assign monitoring work, sch
- `writing-streamlit-apps` — Write Streamlit app source code that runs well in a PostHog sandbox — the posthog_apps.query() bridge for reading PostHog data, the packages baked int

**Clerk**

- `audit-clerk-skill` — Audits the bundled `clerk-cli` skill against the Clerk CLI source tree and proposes or applies updates. Use when the user says "audit the clerk-cli sk
- `audit-expo-skill` — Audits the bundled `clerk-expo` skill against the @clerk/expo SDK source and clerk-docs, then proposes or applies updates. Use when the user says "aud
- `clerk-astro-patterns` — Astro patterns with Clerk — middleware, SSR pages, island components, API routes, static vs SSR rendering. Triggers on: astro clerk, clerk astro middl
- `clerk-billing` — Clerk Billing for subscription management - render Clerk's PricingTable and in-app checkout drawer, configure subscription plans, seat-limit plans for
- `clerk-chrome-extension-patterns` — Chrome Extension auth with @clerk/chrome-extension -- popup/sidepanel setup, syncHost for OAuth/SAML via web app, createClerkClient for service worker
- `clerk-cli` — Operate the Clerk CLI (`clerk` binary) for authentication, user/org/session management, impersonation, local webhook testing, deploy verification, ins
- `clerk-orgs` — Clerk Organizations for B2B and multi-tenant apps - org switching, roles and permissions, verified domains, and enterprise SSO. Use for team workspace
- `clerk-testing` — E2E testing for Clerk apps. Use with Playwright or Cypress for auth flow tests.

**Twilio**

- `twilio-account-setup` — Create and configure a Twilio account from scratch. Covers free trial signup, trial limitations, getting credentials (Account SID and Auth Token), buy
- `twilio-conversation-memory` — Store and retrieve conversation context using Twilio Conversation Memory. Covers Memory Store provisioning, profile management, traits, observations, 
- `twilio-identity-verification-advisor` — Planning skill for identity verification and fraud prevention. Qualifies the developer's needs across authentication method, channel selection, fraud 
- `twilio-security-api-auth` — Choose the right Twilio authentication method and implement it correctly. Covers Auth Token (testing only), API Keys (production standard), OAuth2 cli
- `twilio-sendgrid-account-setup` — Set up a SendGrid account for email delivery. Covers API key creation (SG.-prefix), domain authentication (DKIM/SPF via CNAME records), Single Sender 
- `twilio-sendgrid-deliverability-advisor` — Diagnostic and advisory skill for email deliverability problems. Use when a developer asks why emails are going to spam, not reaching the inbox, getti
- `twilio-verify-send-otp` — Send and verify one-time passcodes (OTPs) via Twilio Verify over SMS (auto-upgraded to RCS where supported), voice, email, or WhatsApp. Covers creatin

**Browserbase**

- `browser` — Automate web browser interactions using natural language via CLI commands. Use when the user asks to browse websites, navigate web pages, extract data
- `cookie-sync` — Sync cookies from local Chrome to a Browserbase persistent context so the browse CLI can access authenticated sites. Use when the user wants to browse
- `fetch` — Use this skill when the user wants to retrieve a URL without a full browser session: fetch HTML or JSON from static pages, inspect status codes or hea
- `search` — Use this skill when the user wants to search the web without a full browser session: find URLs, titles, and metadata for a query. Prefer it over a bro
- `webmcp-gen` — Create, compile, and validate site-specific WebMCP init scripts from a target URL and desired tool capability. Use when the user wants to author WebMC

**BetterAuth**

- `better-auth-security-best-practices` — Configure rate limiting, manage auth secrets, set up CSRF protection, define trusted origins, secure sessions and cookies, encrypt OAuth tokens, track
- `email-and-password-best-practices` — Configure email verification, implement password reset flows, set password policies, and customise hashing algorithms for Better Auth email/password a
- `organization-best-practices` — Configure multi-tenant organizations, manage members and invitations, define custom roles and permissions, set up teams, and implement RBAC using Bett
- `two-factor-authentication-best-practices` — Configure TOTP authenticator apps, send OTP codes via email/SMS, manage backup codes, handle trusted devices, and implement 2FA sign-in flows using Be

**Trail of Bits**

- `gh-cli` — Enforces authenticated gh CLI workflows over unauthenticated curl, WebFetch, and MCP fetch patterns. Use when working with GitHub URLs, API access, pu
- `mermaid-to-proverif` — Translates Mermaid sequenceDiagrams describing cryptographic protocols into ProVerif formal verification models (.pv files). Use when generating a Pro
- `trailmark-review-gate` — Runs a Trailmark structural review gate over a branch, pull request, fix commit, release diff, or git ref range to detect new entrypoints, new tainted
- `zeroize-audit` — Detects missing zeroization of sensitive data in source code and identifies zeroization removed by compiler optimizations, with assembly-level analysi

**Dodo**

- `better-auth-integration` — Dodo Payments plugin for Better Auth (@dodopayments/better-auth) covering customer sync on signup, authenticated checkout, customer portal, usage inge
- `customer-management` — Dodo Payments customer management, covering customer CRUD, saved payment methods, real-money customer wallets and ledger entries, entitlements, and ho
- `subscription-integration` — Dodo Payments subscription lifecycle after checkout, covering trials, statuses like active, on_hold, and cancelled, plan upgrades and downgrades, pror

**HuggingFace**

- `hf-cli` — Hugging Face Hub CLI (`hf`) for downloading, uploading, and managing models, datasets, spaces, buckets, repos, papers, jobs, and more on the Hugging F
- `huggingface-paper-publisher` — Publish and manage research papers on Hugging Face Hub. Supports creating paper pages, linking papers to models/datasets, claiming authorship, and gen
- `huggingface-papers` — Look up and read Hugging Face paper pages in markdown, and use the papers API for structured metadata such as authors, linked models/datasets/spaces, 

**wshobson**

- `pptx-slide-specification` — Use when authoring or repairing a coordinate-explicit JSON specification for an editable PPTX deck.
- `session-guard` — Use when working on complex multi-step tasks, when a session is getting long (40+ tool calls), when the agent starts ignoring rules it followed earlie
- `stride-analysis-patterns` — Apply STRIDE methodology to systematically identify threats. Use when analyzing system security, conducting threat modeling sessions, or creating secu

**Docker**

- `docker-agent-deploy` — Use this skill when exposing a Docker Agent as a server (MCP, HTTP API, A2A, ACP, or OpenAI-compatible chat), distributing an agent via an OCI registr
- `docker-sandboxes-network-credentials` — Use this skill when configuring what a Docker Sandboxes (`sbx`) sandbox can reach on the network or which credentials it authenticates with, even if t

**Firebase**

- `firebase-basics` — Provides foundational Firebase CLI setup, CLI installation, version checks (`firebase-tools@latest --version`), CLI login (including --no-localhost), 
- `firebase-remote-config-basics` — Manages Firebase Remote Config templates, feature flags, loading strategies, and SDKs (Android, iOS). Use when downloading/deploying remoteconfig JSON

**Superpowers**

- `executing-plans` — Use when executing an implementation plan in the current session as the implementer yourself — your human partner chose inline execution, or no subage
- `subagent-driven-development` — Use when executing implementation plans with independent tasks in the current session

**Jeffallan**

- `atlassian-mcp` — Integrates with Atlassian products to manage project tracking and documentation via MCP protocol. Use when querying Jira issues with JQL filters, crea

**OpenRouter**

- `install-ori-harness` — Install Ori and run the user's existing coding agent CLI through Ori on OpenRouter, with OAuth sign-in, model selection, upgrades, and install verific

**TechyMT**

- `error-handling` — Teaches Claude Code's error philosophy: tool call() throws typed errors, the framework catches them and formats them for the LLM as structured tool re

**Corey Haines**

- `onboarding` — When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onbo

**agent-browser**

- `protected-vercel-deployments` — Access and test Vercel deployments protected by Vercel Authentication, SSO, or Deployment Protection with agent-browser. Use when a preview or product

**Vercel Labs**

- `vercel-cli-with-tokens` — Deploy and manage projects on Vercel using token-based authentication. Use when working with Vercel CLI using access tokens rather than interactive lo

## payments-billing (38)


**PostHog**

- `analyzing-offline-evaluations` — Inspect and compare offline AI evaluation experiments, diagnose case-level regressions, and follow scorer history across application, model, or prompt
- `configuring-experiment-analytics` — Configures the analytics side of a PostHog experiment — exposure criteria (server-resolved default exposure event vs custom exposure events), primary 
- `copying-flags-across-projects` — Copy a feature flag from one PostHog project to one or more target projects in the same organization. Use when the user wants to duplicate a flag, pro
- `creating-ai-subscription` — Create a recurring AI-generated PostHog report — schedule a free-text prompt to run on a cron, with the LLM-synthesized markdown delivered to email, S
- `finding-experiments` — Resolves a PostHog experiment reference from natural language to a concrete experiment ID by browsing `experiment-list` (not feature-flag tools), with
- `managing-reminders` — Create and manage PostHog reminders — private, human-paced nudges that fire as in-app notifications on a schedule, optionally linked to a PostHog reso
- `managing-subscriptions` — Create and manage scheduled PostHog subscriptions for insight snapshots, dashboard snapshots, and AI prompt reports. Use when a user wants recurring e
- `posthog-customer-deep-dive` — Use before emailing a PostHog customer, replying to one, or joining a call, and for any request to research a PostHog account. Fires on "/posthog-cust
- `posthog-pls-big-fish` — Research, qualify, and suggest outreach for PostHog big fish product-led leads — large companies (500+ or 1000+ employees) using PostHog on free tier 
- `signals-scout-customer-analytics-billing-and-usage` — Signals scout for per-account product-mix shifts. Watches each staked account's usage and forecasted MRR per product for one product dropping or spiki
- `signals-scout-revenue-analytics` — Signals scout for PostHog revenue analytics. Watches for upstream failures (Stripe sync stalls, capture regressions), and config drift.
- `understanding-billing-usage` — Explains PostHog billing usage and spend from the customer's visible Billing MCP tools. Use when the user asks why usage or spend is high, which produ

**Stripe**

- `stripe-docs` — Use when the user or agent needs to read, search, or look up Stripe documentation or API reference. Prefer this over curl or WebFetch for any docs.str
- `stripe-docs` — Use when the user or agent needs to read, search, or look up Stripe documentation or API reference. Prefer this over curl or WebFetch for any docs.str
- `stripe-docs` — Use when the user or agent needs to read, search, or look up Stripe documentation or API reference. Prefer this over curl or WebFetch for any docs.str
- `stripe-docs` — Use when the user or agent needs to read, search, or look up Stripe documentation or API reference. Prefer this over curl or WebFetch for any docs.str
- `stripe-docs` — Use when the user or agent needs to read, search, or look up Stripe documentation or API reference. Prefer this over curl or WebFetch for any docs.str
- `stripe-pay` — Helps users send funds to another Stripe business, transfer money to a Stripe Profile handle or network ID, or ask whether an agent can pay a Stripe b
- `stripe-pay` — Helps users send funds to another Stripe business, transfer money to a Stripe Profile handle or network ID, or ask whether an agent can pay a Stripe b
- `stripe-pay` — Helps users send funds to another Stripe business, transfer money to a Stripe Profile handle or network ID, or ask whether an agent can pay a Stripe b
- `stripe-pay` — Helps users send funds to another Stripe business, transfer money to a Stripe Profile handle or network ID, or ask whether an agent can pay a Stripe b
- `stripe-pay` — Helps users send funds to another Stripe business, transfer money to a Stripe Profile handle or network ID, or ask whether an agent can pay a Stripe b

**Corey Haines**

- `copywriting` — When the user wants to write, rewrite, or improve marketing copy for any page, including homepage, landing pages, pricing pages, feature pages, about 
- `cro` — When the user wants to optimize, improve, or increase conversions on any marketing page or form — including homepage, landing pages, pricing pages, fe
- `marketing-psychology` — When the user wants to apply psychological principles, mental models, or behavioral science to marketing. Also use when the user mentions 'psychology,
- `paywalls` — When the user wants to create or optimize in-app paywalls, upgrade screens, upsell modals, or feature gates. Also use when the user mentions "paywall,
- `pricing` — When the user wants help with pricing decisions, packaging, or monetization strategy. Also use when the user mentions 'pricing,' 'pricing tiers,' 'fre
- `referrals` — When the user wants to create, optimize, or analyze a referral program, affiliate program, or word-of-mouth strategy. Also use when the user mentions 
- `sales-enablement` — When the user wants to create sales collateral, pitch decks, one-pagers, objection handling docs, or demo scripts. Also use when the user mentions 'sa

**Dodo**

- `credit-based-billing` — Dodo Payments credit-based billing with credit entitlements, grants, balances, ledger deductions, rollover, expiry, low-balance alerts, and overage. U
- `dodo-best-practices` — Starting point for any Dodo Payments integration, covering Merchant of Record basics, SDK installation and client setup, test and live environments, A
- `dodo-mcp-usage` — How and when to use the Dodo Payments MCP servers (dodo-knowledge for docs search, dodopayments-api for the live API via Code Mode) safely. Use when l
- `localized-pricing` — Dodo Payments multi-currency pricing, covering fixed localized prices per country or currency, Adaptive Currency live FX conversion at checkout, and p
- `testing-and-go-live` — Dodo Payments test mode and production launch, covering test cards and payment methods, success and decline scenarios, renewal simulation, local webho
- `usage-based-billing` — Dodo Payments usage-based billing that charges per measured unit, covering meters, usage event ingestion by event_name, aggregation, free thresholds, 

**OpenRouter**

- `openrouter-analytics` — Answer natural-language questions about a user's OpenRouter usage data — spend, request volume, model breakdown, latency, token usage, and cost optimi
- `openrouter-models` — Query OpenRouter for available AI models, pricing, capabilities, throughput, and provider performance. Use when the user asks about available OpenRout

**Firecrawl**

- `firecrawl-competitive-intel` — Monitor competitor pricing, features, changelogs, dashboards, and product changes with Firecrawl. Use for recurring competitive intelligence, pricing 

## realtime-concurrency (14)


**PostHog**

- `context-layer-consolidation` — Keep the context wiki coherent using the deterministic lint report queue
- `filtering-bot-traffic` — Identify, measure, and exclude bot / crawler / AI-agent traffic in PostHog web and product analytics using the traffic classification surface (the isL
- `investigating-metric-anomalies` — Investigates server/infrastructure metric anomalies in PostHog Metrics — from "this metric is rising/dropping/spiking" or a fired alert to a probable 
- `setting-up-data-catalog` — Populates and maintains a project's data catalog (semantic layer): canonical metrics, trust marks (certifications) on warehouse tables/views, and revi

**HuggingFace**

- `hf-cloud-sagemaker-deployment-planner` — Plan and coordinate the deployment of a model to Amazon SageMaker AI. Use this skill whenever the user wants to deploy, host, serve, or expose a model
- `hf-cloud-sagemaker-production-defaults` — Create a SageMaker endpoint (real-time, real-time scale-to-zero, or async) with autoscaling, CloudWatch alarms, and tagging enabled by default. Use th
- `huggingface-trackio` — Track and visualize ML training experiments with Trackio. Use when logging metrics during training (Python API), firing alerts for training diagnostic

**Twilio**

- `twilio-agent-augmentation-architect` — Planning skill for augmenting human agents with real-time AI intelligence. Qualifies the developer's use case across coaching, compliance, QA, and rou
- `twilio-taskrouter-routing` — Route tasks to agents using Twilio TaskRouter. Covers Workers, Task Queues, Workflows, Reservations, skills-based routing, and common gotchas (hyphen 

**wshobson**

- `modern-javascript-patterns` — Master ES6+ features including async/await, destructuring, spread operators, arrow functions, promises, modules, iterators, generators, and functional
- `python-background-jobs` — Python background job patterns including task queues, workers, and event-driven architecture. Use when implementing async task processing, job queues,

**Jeffallan**

- `embedded-systems` — Use when developing firmware for microcontrollers, implementing RTOS applications, or optimizing power consumption. Invoke for STM32, ESP32, FreeRTOS,

**TechyMT**

- `async-concurrency` — Teaches Claude Code's concurrency model: isConcurrencySafe() for parallel tool execution, AbortController propagation for cancellation, Promise.all() 

**Trail of Bits**

- `rust-review` — Performs comprehensive Rust security review for safe/unsafe boundary issues, memory safety in unsafe blocks, concurrency hazards, panic-induced DoS, F

## testing-quality (38)


**Trail of Bits**

- `code-maturity-assessor` — Systematic code maturity assessment using Trail of Bits' 9-category framework. Analyzes codebase for arithmetic safety, auditing practices, access con
- `constant-time-testing` — Measures timing side channels in cryptographic implementations by running them, using dudect for statistical analysis and Timecop over Valgrind for dy
- `differential-review` — Performs security-focused differential review of code changes. Adapts analysis depth to codebase size, uses git blame for context, calculates blast ra
- `genotoxic` — Graph-informed mutation testing triage. Parses codebases with Trailmark, runs mutation testing and necessist, then uses survived mutants, unnecessary 
- `implement-patch` — Use when a confirmed local bug needs an invariant-level fix, variant search, tests, and one local commit.
- `review-pr` — Reviews the current branch's changes against its base branch as a pull request: correctness of new and modified code, test coverage for it, and docume
- `semgrep-rule-variant-creator` — Creates language variants of existing Semgrep rules. Use when porting a Semgrep rule to specified target languages. Takes an existing rule and target 
- `wycheproof` — Validates cryptographic implementations against Project Wycheproof's test vectors, which encode known attacks and edge cases across AES, RSA, ECDSA, E

**wshobson**

- `dependency-upgrade` — Manage major dependency version upgrades with compatibility analysis, staged rollout, and comprehensive testing. Use when upgrading framework versions
- `javascript-testing-patterns` — Implement comprehensive testing strategies using Jest, Vitest, and Testing Library for unit tests, integration tests, and end-to-end testing with mock
- `llm-evaluation` — Implement comprehensive evaluation strategies for LLM applications using automated metrics, human feedback, and benchmarking. Use when testing LLM per
- `sast-configuration` — Configure Static Application Security Testing (SAST) tools for automated vulnerability detection in application code. Use when setting up security sca
- `temporal-python-testing` — Test Temporal workflows with pytest, time-skipping, and mocking strategies. Covers unit testing, integration testing, replay testing, and local develo

**PostHog**

- `configuring-experiment-rollout` — Configures the rollout shape of a PostHog experiment — the variant split (50/50, 80/20, A/B/C ratios), the overall rollout percentage that gates how m
- `experiment-audit` — Audit a PostHog A/B experiment for a customer — verify config, exposure, attribution, and metrics. Trigger phrases include \"audit [customer]'s experi
- `posthog-debugger` — Debug and inspect PostHog implementations on any website. Use this skill when a user wants to understand how PostHog is implemented on a page, trouble
- `triaging-visual-review-runs` — Inspects PostHog Visual Review (VR) runs that gate PR merges with screenshot regression checks. Use when the user mentions "visual review", "VR", "sna

**Corey Haines**

- `analytics` — When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google
- `attribution` — When the user wants to figure out which marketing actually drives conversions and revenue, choose or interpret an attribution model, or reconcile conf
- `launch` — When the user wants to plan a product launch, feature announcement, or release strategy. Also use when the user mentions 'launch,' 'Product Hunt,' 'fe
- `marketing-loops` — When the user wants to set up a recurring, self-running marketing workflow — a repeatable loop an AI agent runs on a cadence (weekly, daily, on a trig

**Jeffallan**

- `django-storages-s3` — Use when configuring Django to store static and media files on AWS S3 with django-storages. Invoke when working with the STORAGES setting, S3 buckets,
- `monitoring-expert` — Configures monitoring systems, implements structured logging pipelines, creates Prometheus/Grafana dashboards, defines alerting rules, and instruments
- `terraform-engineer` — Use when implementing infrastructure as code with Terraform across AWS, Azure, or GCP. Invoke for module development (create reusable modules, manage 

**Superpowers**

- `finishing-a-development-branch` — Use when implementation is complete, all tests pass, and you need to decide how to integrate the work
- `systematic-debugging` — Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- `test-driven-development` — Use when implementing any feature or bugfix, before writing implementation code

**Firecrawl**

- `firecrawl-qa` — Test a live website with Firecrawl browser and write up what's broken: links, forms, mobile layout, performance and console errors. Use for pre-launch
- `firecrawl-seo-audit` — Inspect a website's titles, meta descriptions, headings, canonicals, structured data and internal links for on-page and technical SEO issues. Use for 

**Playwright CLI**

- `dev` — Development workflows for the playwright-cli repository. Use when the user asks about rolling dependencies, releasing, or other repo maintenance tasks
- `playwright-cli` — Automate browser interactions, test web pages and work with Playwright tests.

**Twilio**

- `twilio-call-recordings` — Record Twilio voice calls correctly. Covers the critical distinction between Record verb (voicemail) and Dial record (call recording), dual-channel fo
- `twilio-sendgrid-email-send` — Send transactional and bulk email via the SendGrid v3 Mail Send API. Covers single sends, personalized batch sends with dynamic templates, scheduled s

**OpenRouter**

- `spawn-ori-eval` — Spawn Ori as a subprocess to run a throwaway model eval on a pinned harness and model, then relay the results. Use when the user asks which model they

**antfu**

- `vitest` — Vitest fast unit testing framework powered by Vite with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with te

**Anthropic**

- `skill-creator` — Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or opt

**Browserbase**

- `agent-experience` — Audit the developer experience of a product, SDK, docs site, or SKILL.md by dropping multiple Claude subagents at it with only a tiny task prompt and 

**Expo**

- `expo-skill-eval` — Evaluate Expo skills in this repo end-to-end - trigger accuracy, generated code quality, and runtime screenshots on iOS simulator and Android emulator

## security (57)


**Trail of Bits**

- `agentic-actions-auditor` — Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitH
- `algorand-vulnerability-scanner` — Scans Algorand smart contracts for 11 common vulnerabilities including rekeying attacks, unchecked transaction fees, missing field validations, and ac
- `audit-augmentation` — Augments Trailmark code graphs with external audit findings from SARIF static analysis results, weAudit annotation files, and version-gated Trailmark 
- `c-review` — Performs comprehensive C/C++ security review for memory corruption, integer overflows, race conditions, and platform-specific vulnerabilities. Use whe
- `cairo-vulnerability-scanner` — Scans Cairo/StarkNet smart contracts for 6 critical vulnerabilities including felt252 arithmetic overflow, L1-L2 messaging issues, address conversion 
- `constant-time-analysis` — Detects timing side-channel vulnerabilities in cryptographic code. Use when implementing or reviewing crypto code, encountering division on secrets, s
- `cosmos-vulnerability-scanner` — Scans Cosmos SDK blockchain modules and CosmWasm contracts for consensus-critical vulnerabilities — chain halts, fund loss, state divergence. 25 core 
- `crypto-protocol-diagram` — Extracts protocol message flow from source code, RFCs, academic papers, pseudocode, informal prose, ProVerif (.pv), or Tamarin (.spthy) models and gen
- `dimensional-analysis` — Audits code for unit and decimal-scaling bugs and annotates it with dimensional comments recording the units of each value. Use when someone asks to a
- `entry-point-analyzer` — Analyzes smart contract codebases to identify state-changing entry points for security auditing. Detects externally callable functions that modify sta
- `fp-check` — Systematically verifies suspected security bugs to eliminate false positives, producing a TRUE POSITIVE or FALSE POSITIVE verdict with documented evid
- `graph-evolution` — Compares Trailmark code graphs at two source code snapshots (git commits, tags, or directories) to surface security-relevant structural changes. Detec
- `panel-review` — Reviews a code target by launching a panel of specialist auditor agents and merging their reports. Use when asked to run a panel review.
- `post-patch-validation` — Validates security patches with reproducible baseline-versus-patched evidence, including original exploits, root-cause variants, behavior preservation
- `prove-patch` — Use when a local security patch commit needs independent scoped and three-arm proof.
- `semgrep` — Runs a Semgrep security scan over a codebase: detects languages, selects rulesets, presents the plan for explicit approval, then runs every approved r
- `solana-vulnerability-scanner` — Scans Solana programs for 6 critical vulnerabilities including arbitrary CPI, improper PDA validation, missing signer/ownership checks, and sysvar spo
- `substrate-vulnerability-scanner` — Scans Substrate/Polkadot pallets for 7 critical vulnerabilities including arithmetic overflow, panic DoS, incorrect weights, and bad origin checks. Us
- `supply-chain-risk-auditor` — Audits a project's dependencies for supply-chain risk: version-matched advisories for direct dependencies and the full lockfile tree, abandoned or arc
- `token-integration-analyzer` — Token integration and implementation analyzer based on Trail of Bits' token integration checklist. Analyzes token implementations for ERC20/ERC721 con
- `ton-vulnerability-scanner` — Scans TON (The Open Network) smart contracts for 3 critical vulnerabilities including integer-as-boolean misuse, fake Jetton contracts, and forward TO
- `trailmark-finding-triage` — Performs graph-assisted triage of a single security finding, SARIF result, weAudit annotation, suspicious function, or report excerpt using Trailmark 
- `trailmark-variant-neighborhood` — Expands one confirmed or suspected vulnerability into a Trailmark graph neighborhood of variant candidates by finding sibling functions, shared caller
- `variant-analysis` — Hunts for the other instances of a bug already found — the variants of one root cause across a codebase. Use immediately after a vulnerability, logic 
- `vulnerability-triage-brocards` — This skill should be used when the user asks to "triage a vulnerability report", "assess a CVE", "evaluate a bug bounty submission", "decide if a find

**PostHog**

- `auditing-endpoints` — Audit every endpoint in a PostHog project for staleness, failed materialisations, and unused materialised versions. Use when the user asks "what endpo
- `auditing-experiments-flags` — Audit PostHog experiments and feature flags for configuration issues, staleness, and best-practice violations. Read when the user asks to audit, healt
- `auditing-warehouse-view-health` — Audit the health of a PostHog project's materialized views (saved queries) — find every failed materialization and flag unused or stale materialized v
- `diagnosing-endpoint-performance` — Diagnose why a PostHog endpoint is slow or expensive and propose a concrete fix — bump the cache TTL, enable materialisation, restructure variables, o
- `exploring-endpoint-execution-logs` — Explore and diagnose a PostHog endpoint's execution logs — error messages, failed runs, cache misses, slow runs, or unexpected row counts during endpo
- `finding-deleted-feature-flags` — Find feature flags that were soft-deleted in the active project within a recent time window. Use when the user asks "what flags were deleted in the la
- `review-hog-perspective-contracts-security` — Checks security, input validation, and API compatibility. Reports security and contract issues only.
- `review-hog-validation-criteria` — Keeps findings that affect correctness, security, data, API compatibility, or performance. Drops speculative issues and style suggestions before publi
- `signals-scout-apm` — Signals scout for PostHog distributed tracing (APM / OpenTelemetry spans). Watches per-service RED metrics for error-rate and latency regressions, new
- `signals-scout-csp-violations` — Signals scout for Content Security Policy violations. Watches `$csp_violation` events for blocked-URL clusters, per-directive bursts, post-deploy regr
- `signals-scout-experiments` — Signals scout for PostHog A/B experiments. Watches running experiments for validity threats — sample ratio mismatch, contamination, exposure stalls, m

**wshobson**

- `avoid-ai-writing` — Audit and rewrite prose so it stops reading as machine-generated. Use this skill when asked to remove AI-isms, clean up AI writing, edit a draft for A
- `k8s-security-policies` — Implement Kubernetes security policies including NetworkPolicy, PodSecurityPolicy, and RBAC for production-grade security. Use when securing Kubernete
- `linkerd-patterns` — Implement Linkerd service mesh patterns for lightweight, security-focused service mesh deployments. Use when setting up Linkerd, configuring traffic p
- `protect-mcp-setup` — Configure Cedar policy enforcement and Ed25519 signed receipts for Claude Code tool calls. Use when setting up projects that need cryptographic audit 
- `review-agent-setup` — Configure human-in-the-loop gating for AI agent review actions in Claude Code. Use when setting up a project where an agent may post PR reviews, comme
- `secrets-management` — Implement secure secrets management for CI/CD pipelines using Vault, AWS Secrets Manager, or native platform solutions. Use when handling sensitive cr
- `signed-audit-trails-recipe` — Step-by-step cookbook for setting up cryptographically signed audit trails on Claude Code tool calls. Use when explaining, evaluating, or demonstratin
- `social-evidence-research` — Research public discussion on social platforms and keep every report claim tied to the source material that supports it. Use when researching or compa
- `solidity-security` — Master smart contract security best practices to prevent common vulnerabilities and implement secure Solidity patterns. Use when writing smart contrac
- `threat-mitigation-mapping` — Map identified threats to appropriate security controls and mitigations. Use when prioritizing security investments, creating remediation plans, or va

**Corey Haines**

- `ads` — When the user wants help with paid advertising campaigns on Google Ads, Meta (Facebook/Instagram), LinkedIn, Twitter/X, or other ad platforms. Also us
- `aso` — When the user wants to audit or optimize an App Store or Google Play listing. Also use when the user mentions 'ASO audit,' 'app store optimization,' '
- `competitor-profiling` — When the user wants to research, profile, or analyze competitors from their URLs. Also use when the user mentions 'competitor profile,' 'competitor re
- `competitors` — When the user wants to create competitor comparison or alternative pages for SEO and buyer-facing use. Also use when the user mentions 'alternative pa
- `content-strategy` — When the user wants to plan a content strategy, decide what content to create, or figure out what topics to cover. Also use when the user mentions "co
- `copy-editing` — When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,

**Jeffallan**

- `kubernetes-specialist` — Use when deploying or managing Kubernetes workloads. Invoke to create deployment manifests, configure pod security policies, set up service accounts, 
- `the-fool` — Use when challenging ideas, plans, decisions, or proposals using structured critical reasoning. Invoke to play devil's advocate, run a pre-mortem, red

**K8s**

- `kubernetes-skill` — Prevent Kubernetes hallucinations by diagnosing and fixing failure modes: insecure workload defaults, resource starvation, network exposure, privilege

**Firebase**

- `extension-to-functions-codebase` — Skill for converting an installed Firebase Extension (or extension source) into a standalone Cloud Functions for Firebase codebase or publishable npm 

**Twilio**

- `twilio-messaging-webhooks` — Receive and respond to inbound messages and track outbound delivery status via Twilio webhooks — across SMS, MMS, WhatsApp, and RCS. Covers webhook re

## performance (37)


**wshobson**

- `binary-analysis-patterns` — Master binary analysis patterns including disassembly, decompilation, control flow analysis, and code pattern recognition. Use when analyzing executab
- `cost-optimization` — Optimize cloud costs across AWS, Azure, GCP, and OCI through resource rightsizing, tagging strategies, reserved instances, and spending analysis. Use 
- `debugging-strategies` — Master systematic debugging techniques, profiling tools, and root cause analysis to efficiently track down bugs across any codebase or technology stac
- `distributed-tracing` — Implement distributed tracing with Jaeger and Tempo to track requests across microservices and identify performance bottlenecks. Use when debugging mi
- `embedding-strategies` — Select and optimize embedding models for semantic search and RAG applications. Use when choosing embedding models, implementing chunking strategies, o
- `finetuning-method-selection` — Decide whether to fine-tune at all, and route to the right method (SFT, DPO/ORPO/KTO, GRPO/RLVR, continued pretraining) and base model. Use when start
- `hads` — Use when writing technical documentation that needs to be readable by both humans and AI models, converting existing docs to HADS format, validating a
- `memory-safety-patterns` — Implement memory-safe programming with RAII, ownership, smart pointers, and resource management across Rust, C++, and C. Use when writing safe systems
- `parallel-debugging` — Debug complex issues using competing hypotheses with parallel investigation, evidence collection, and root cause arbitration. Use this skill when debu
- `preference-optimization` — Align a fine-tuned model with preference data using DPO, ORPO, KTO, or SimPO. Use when preference pairs or thumbs-up/down feedback exist, when choosin
- `python-performance-optimization` — Profile and optimize Python code using cProfile, memory profilers, and performance best practices. Use when debugging slow Python code, optimizing bot
- `slo-implementation` — Define and implement Service Level Indicators (SLIs) and Service Level Objectives (SLOs) with error budgets and alerting. Use when establishing reliab
- `spark-memory-thermal-ops` — Manage unified memory and thermals during long-running ML jobs on NVIDIA DGX Spark. Use when planning memory headroom for a training run on GB10, when
- `spark-optimization` — Optimize Apache Spark jobs with partitioning, caching, shuffle optimization, and memory tuning. Use when improving Spark performance, debugging slow j
- `startup-metrics-framework` — Track, calculate, and optimize key performance metrics for SaaS, marketplace, consumer, and B2B startups from seed through Series A, including unit ec
- `uv-package-manager` — Master the uv package manager for fast Python dependency management, virtual environments, and modern Python project workflows. Use when setting up Py
- `vector-index-tuning` — Optimize vector index performance for latency, recall, and memory. Use when tuning HNSW parameters, selecting quantization strategies, or scaling vect

**PostHog**

- `review-hog-perspective-performance-reliability` — Checks resource use, error recovery, and scaling. Reports performance and reliability issues only.
- `signals` — How to query the document_embeddings table for raw signal data using HogQL. Use when you need to perform semantic search over signals, fetch every sig
- `signals-scout-ai-observability` — Signals scout for PostHog AI observability. Watches LLM traces for cost, latency, error, volume, and eval-performance regressions.
- `signals-scout-health-checks` — Signals scout over PostHog's own health checks. Bundles the project's active health issues by kind, weights them by blast radius, and surfaces the one
- `signals-scout-web-vitals` — Signals scout for Core Web Vitals (`$web_vitals`). Watches each page's p75 LCP / INP / CLS / FCP against Google's thresholds and its own history — poo

**Corey Haines**

- `directory-submissions` — When the user wants to submit their product to startup, SaaS, AI, agent, MCP, no-code, or review directories for backlinks, domain rating, and discove
- `emails` — When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user m
- `lead-magnets` — When the user wants to create, plan, or optimize a lead magnet for email capture or lead generation. Also use when the user mentions "lead magnet," "g
- `signup` — When the user wants to optimize signup, registration, account creation, or trial activation flows. Also use when the user mentions "signup conversions

**TechyMT**

- `observability` — Teaches Claude Code's logging and instrumentation conventions: logForDebugging for local structured debug output, logEvent for telemetry analytics eve
- `permission-system` — Teaches Claude Code's multi-layered permission system: permission modes (default/bypass/auto), the checkPermissions method on tool definitions, per-to
- `skill-and-command-dispatch` — Teaches Claude Code's Skill and Command system: how slash commands (/commit, /plan) are defined as PromptCommand or LocalCommand, how skills are loade

**Jeffallan**

- `debugging-wizard` — Parses error messages, traces execution flow through stack traces, correlates log entries to identify failure points, and applies systematic hypothesi
- `pandas-pro` — Performs pandas DataFrame operations for data analysis, manipulation, and transformation. Use when working with pandas DataFrames, data cleaning, aggr

**Trail of Bits**

- `pr-improver` — Runs an autonomous review-and-fix improvement loop over the current branch's changes until a PR review comes back clean, scoped mechanically to the di
- `skill-improver` — Runs an autonomous review-and-fix improvement loop over a Claude Code skill until a review comes back clean, with a cross-round findings ledger, escal

**Anthropic**

- `docx` — Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files) or Word templates (.dotx files). Triggers inc

**Firecrawl**

- `firecrawl-business-contacts` — Find the published business contacts of companies with Firecrawl, whether the user names them or describes them by type and place: press and media, sa

**HuggingFace**

- `hf-cloud-serving-image-selection` — Pick the right serving container for a SageMaker model deployment and find its current image URI. Use this skill whenever about to deploy a model to a

**Twilio**

- `twilio-conversation-orchestrator` — Configure automatic conversation capture and routing with Twilio Conversation Orchestrator. Covers Configuration creation, channel capture rules, grou

## devops-observability (140)


**PostHog**

- `analyzing-expensive-users` — Analyze the most expensive users in AI observability and explain why they cost so much. Use when the user asks about top spenders, expensive users, pe
- `checking-deploy-timing` — Determine when a PostHog code change reached a given environment by reading the hidden GIT deploy annotations in the project and correlating them with
- `debugging-failed-data-quality-checks` — Finds out why a data quality check failed or errored, looks at the rows it matched, and recommends the fix. Also covers a materialized view refresh th
- `error-tracking-android` — PostHog error tracking for Android
- `error-tracking-android` — PostHog error tracking for Android
- `error-tracking-angular` — PostHog error tracking for Angular
- `error-tracking-angular` — PostHog error tracking for Angular
- `error-tracking-flutter` — PostHog error tracking for Flutter
- `error-tracking-flutter` — PostHog error tracking for Flutter
- `error-tracking-go` — PostHog error tracking for Go
- `error-tracking-go` — PostHog error tracking for Go
- `error-tracking-hono` — PostHog error tracking for Hono
- `error-tracking-hono` — PostHog error tracking for Hono
- `error-tracking-node` — PostHog error tracking for Node.js
- `error-tracking-node` — PostHog error tracking for Node.js
- `error-tracking-python` — PostHog error tracking for Python
- `error-tracking-python` — PostHog error tracking for Python
- `error-tracking-ruby` — PostHog error tracking for Ruby
- `error-tracking-ruby` — PostHog error tracking for Ruby
- `error-tracking-ruby-on-rails` — PostHog error tracking for Ruby on Rails
- `error-tracking-ruby-on-rails` — PostHog error tracking for Ruby on Rails
- `error-tracking-svelte` — PostHog error tracking for Svelte
- `error-tracking-svelte` — PostHog error tracking for Svelte
- `error-tracking-web` — PostHog error tracking for Web (JavaScript)
- `error-tracking-web` — PostHog error tracking for Web (JavaScript)
- `exploring-llm-clusters` — Investigate AI observability clusters — understand usage patterns in AI/LLM traffic, compare cluster behavior, compute cost/latency metrics, and drill
- `exploring-llm-evaluations` — Investigate AI observability evaluations — `hog` (deterministic code-based), `llm_judge` (LLM-prompt-based), and `sentiment` (user-message sentiment).
- `exploring-mcp-intent-clusters` — Explore PostHog MCP intent clusters — agent goals grouped by semantic similarity, with each cluster's tool distribution and error rates, plus the tool
- `exploring-mcp-tool-quality` — Investigate the quality of PostHog MCP tool calls — error rates, latency, reach, and which tools are failing or slow. Use when the user asks "which MC
- `exploring-mcp-tool-usage` — Starting point for exploring how a PostHog MCP server's tools are used — routes a broad question to the typed tool that answers it. Use when the user 
- `grouping-noisy-errors` — Consolidate PostHog error tracking issues that are the same actual error reported under different fingerprints. Use when the user asks "why do I have 
- `inbox-exploration` — Explore PostHog's Inbox and act on what it surfaces — the place where signal reports cluster into actionable issues and trends. Use when the user asks
- `instrument-error-tracking` — Add PostHog error tracking to capture and monitor exceptions. Use after implementing features or reviewing PRs to ensure errors are tracked with stack
- `instrument-llm-analytics` — Add PostHog AI Observability to trace AI model usage. Use after implementing LLM features or reviewing PRs to ensure all generations are captured with
- `instrument-logs` — Add PostHog log capture to track application logs. Use after implementing features or reviewing PRs to ensure meaningful log events are captured with 
- `logs-datadog` — PostHog logs for Datadog
- `logs-datadog` — PostHog logs for Datadog
- `logs-go` — PostHog logs for Go
- `logs-go` — PostHog logs for Go
- `logs-java` — PostHog logs for Java
- … +25 more (see registry.jsonl)

**wshobson**

- `ai-debt-detector` — Use after generating code, after accepting AI suggestions, or when reviewing AI-written modules. Also use when code works but feels brittle, when erro
- `architecture-decision-records` — Write and maintain Architecture Decision Records (ADRs) following best practices for technical decision documentation. Use when documenting significan
- `changelog-automation` — Automate changelog generation from commits, PRs, and releases following Keep a Changelog format. Use when setting up release workflows, generating rel
- `employment-contract-templates` — Create employment contracts, offer letters, and HR policy documents following legal best practices. Use when drafting employment agreements, creating 
- `git-advanced-workflows` — Master advanced Git workflows including rebasing, cherry-picking, bisect, worktrees, and reflog to maintain clean history and recover from any situati
- `lora-qlora-recipes` — Configure LoRA and QLoRA supervised fine-tuning with current best-practice hyperparameters. Use when writing or reviewing a LoRA/QLoRA training config
- `postmortem-writing` — Write effective blameless postmortems with root cause analysis, timelines, and action items. Use when conducting incident reviews, writing postmortem 
- `pptx-visual-assets` — Use when selecting and placing approved supporting icons, images, SVGs, diagrams, or infographics in an editable PPTX deck.
- `prometheus-configuration` — Set up Prometheus for comprehensive metric collection, storage, and monitoring of infrastructure and applications. Use when implementing metrics colle
- `python-configuration` — Python configuration management via environment variables and typed settings. Use when externalizing config, setting up pydantic-settings, managing se
- `python-observability` — Python observability patterns including structured logging, metrics, and distributed tracing. Use when adding logging, implementing metrics collection
- `service-mesh-observability` — Implement comprehensive observability for service meshes including distributed tracing, metrics, and visualization. Use when setting up mesh monitorin
- `shellcheck-configuration` — Master ShellCheck static analysis configuration and usage for shell script quality. Use when setting up linting infrastructure, fixing code issues, or
- `spark-environment-setup` — Set up a working ML training/inference environment on NVIDIA DGX Spark (GB10, aarch64, CUDA 13). Use when installing PyTorch/Unsloth/TRL/vLLM on DGX S
- `team-communication-protocols` — Structured messaging protocols for agent team communication including message type selection, plan approval, shutdown procedures, and anti-patterns to
- `track-management` — Use this skill when creating, managing, or working with Conductor tracks - the logical work units for features, bugs, and refactors. Applies to spec.m

**Firecrawl**

- `firecrawl` — Any live-web task via the Firecrawl CLI — including ordinary web research: searching the web, reading or extracting pages, gathering sources, discover
- `firecrawl-company-directories` — Extract structured company lists with Firecrawl from any page or site that lists companies: accelerator batches, VC portfolios, member and sponsor lis
- `firecrawl-dashboard-reporting` — Read metrics off web dashboards with Firecrawl browser: public stats, status and transparency pages as well as analytics tools the user is signed in t
- `firecrawl-developer-index` — Searches current documentation, release notes, API references and public repository issues for libraries, frameworks, SDKs, APIs and CLI tools with `f
- `firecrawl-fantasy-sports` — Help fantasy players make start/sit, waiver, streaming, trade, draft and keeper decisions using current player news, usage, matchups and their league'
- `firecrawl-knowledge-ingest` — Export documentation portals, help centers and API reference sites into local markdown or JSON with Firecrawl browser, including pages that render wit
- `firecrawl-lead-research` — Enrich and research the people and companies the user names or supplies with Firecrawl Alexandria data: background on a person, a professional profile
- `firecrawl-market-research` — Research markets and companies with Firecrawl using current, cited figures: market size, growth, trends, financials and earnings. Use when the user as
- `firecrawl-monitor` — Alert by webhook/email on web changes — use for "monitor/watch/track/alert me when": recurring checks on known URLs (prefer over repeated one-off scra
- `firecrawl-research-index` — Find the papers that answer a research query in Firecrawl's research paper index — a corpus of paper abstracts whose largest share is biomedical and l
- `firecrawl-research-papers` — Find and synthesize research papers, whitepapers, PDFs, technical reports, and academic sources with Firecrawl Research, using semantic paper search, 
- `firecrawl-search` — Find web sources with query-relevant page excerpts and optional full-page content, and discover workflows, data APIs, and indexes. Use for web researc

**Trail of Bits**

- `adjudicate-regression` — Use when deciding whether source and live reproduction evidence establish a new regression or an exclusion.
- `code-improver` — Runs an autonomous review-and-fix improvement loop over any code target — a skill, plugin, module, or directory — using a reviewer the user names: any
- `devcontainer-setup` — Creates devcontainers with Claude Code, language-specific tooling (Python/Node/Rust/Go), and persistent volumes. Use when adding devcontainer support 
- `diagramming-code` — Generates Mermaid diagrams from Trailmark code graphs. Produces call graphs, class hierarchies, module dependency maps, containment diagrams, complexi
- `github-triage` — Triages a repository's open GitHub issues and pull requests via the gh CLI. Optionally reviews and merges ready PRs — incrementally merging passing au
- `interpreting-culture-index` — Interprets Culture Index (CI) surveys, behavioral profiles, and personality assessment data. Supports individual profile interpretation, team composit
- `open-sourcing` — This skill should be used when the user asks to "open source this project", "prepare this repository for public release", "make this repo public", "ch
- `replay-regression` — Use when independently verifying a supplied PoC against fresh live before/after deployments.
- `report-regressions` — Use when assembling or refreshing an evidence-linked regression report from saved campaign decisions.
- `review-walkthrough` — Generates an interactive HTML walkthrough for reviewing code changes. Use only when explicitly called.
- `sarif-parsing` — Parses and processes SARIF files from static analysis tools like CodeQL, Semgrep, or other scanners. Triggers on "parse sarif", "read scan results", "
- `slicing-code-context` — Selects bounded, graph-informed source slices with Trailmark and delegates focused code analysis or patch-proposal work to a smaller subagent. Use whe

**Twilio**

- `twilio-cli-reference` — Twilio CLI reference for managing Twilio resources from the terminal. Covers installation, credential profiles, phone number provisioning, sending SMS
- `twilio-debugging-observability` — Debug Twilio integrations and set up production observability. Covers the Console Debugger, Monitor Alerts API, Event Streams for error log streaming,
- `twilio-email-deliverability-advisor` — Deliverability advisor for the Twilio Email API specifically. Use ONLY when the developer explicitly mentions Twilio Email, comms.twilio.com, or a Twi
- `twilio-enterprise-knowledge` — Add knowledge retrieval (RAG) to AI agents using Twilio Enterprise Knowledge. Covers provisioning Knowledge Bases, uploading sources from web URLs, PD
- `twilio-messaging-services` — Create and configure Twilio Messaging Services for production messaging. Covers sender pools, geo-match, sticky sender, message scheduling, compliance
- `twilio-organizations-setup` — Set up and manage Twilio Organizations for centralized account and user governance. Covers the Organization > Account > Subaccount hierarchy, roles (O
- `twilio-sms-send-message` — SMS and MMS deep-dive reference. Covers SMS-specific error codes, message filtering troubleshooting ("Messages Being Filtered or Blocked?" diagnostic 

**HuggingFace**

- `hf-cloud-aws-context-discovery` — Discover the user's local AWS context (active profile, region, account ID, caller identity) at the start of any AWS task. Use this skill before any ot
- `hf-cloud-python-env-setup` — Set up an isolated Python environment for SageMaker / AWS work, with the right Python version and current boto3. Use this skill whenever Python code w
- `huggingface-best` — Use when the user asks about finding the best, top, or recommended model for a task, wants to know what AI model to use, or wants to compare models by
- `huggingface-vision-trainer` — Trains and fine-tunes vision models for object detection (D-FINE, RT-DETR v2, DETR, YOLOS), image classification (timm models — MobileNetV3, MobileViT

**Jeffallan**

- `devops-engineer` — Creates Dockerfiles, configures CI/CD pipelines, writes Kubernetes manifests, and generates Terraform/Pulumi infrastructure templates. Handles deploym
- `fine-tuning-expert` — Use when fine-tuning LLMs, training custom models, or adapting foundation models for specific tasks. Invoke for configuring LoRA/QLoRA adapters, prepa
- `spec-miner` — Reverse-engineering specialist that extracts specifications from existing codebases. Use when working with legacy or undocumented systems, inherited p

**Corey Haines**

- `marketing-council` — When the user wants multiple expert perspectives on a marketing question — a simulated board of advisors staffed by legendary marketers (Seth Godin, D
- `marketing-ideas` — When the user needs marketing ideas, inspiration, or strategies for their SaaS or software product. Also use when the user asks for 'marketing ideas,'
- `public-relations` — When the user wants help with public relations, earned media, press coverage, journalist outreach, or media strategy (not pull requests). Also use whe

**antfu**

- `pinia` — Pinia official Vue state management library, type-safe and extensible. Use when defining stores, working with state/getters/actions, or implementing s
- `pnpm` — Node.js package manager with strict dependency resolution. Use when running pnpm specific commands, configuring workspaces via pnpm-workspace.yaml, or

**Anthropic**

- `discernment-nudge` — After you give a substantive answer or draft that the user may act on — advice or recommendations, drafted artifacts such as goals, plans, pitches, pr
- `internal-comms` — A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill

**Browserbase**

- `browser-use-to-stagehand` — Migrate browser-use (Python) browser-automation scripts to Stagehand v3 (TypeScript) on Browserbase. Use when the user wants to convert, port, rewrite
- `functions` — Deploy serverless browser automation as cloud functions using Browserbase. Use when the user wants to deploy browser automation to run on a schedule o

**Expo**

- `expo-app-clip` — Add an iOS App Clip target to an Expo app. Use when the user mentions App Clip, AASA, apple-app-site-association, appclips, smart app banner, or wants
- `expo-project-structure` — Folder structure for a new Expo app. Use when scaffolding or laying out a new Expo project with Expo Router, or deciding where a file should live in o

**Firebase**

- `firebase-ai-logic-basics` — Integrates Firebase AI Logic (formerly Vertex AI for Firebase) into mobile and web apps (Android, iOS, Web, and Flutter) to call Gemini models from cl
- `xcode-project-setup` — Safely modifies Xcode projects (.pbxproj) to add Swift Packages and link files. Use this skill whenever an iOS project needs dependencies installed (e

**Superpowers**

- `dispatching-parallel-agents` — Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
- `writing-skills` — Use when creating new skills, editing existing skills, or verifying skills work before deployment

**OpenRouter**

- `openrouter-generations` — Retrieve detailed metadata and stored content for individual OpenRouter generations. Use when the user wants to inspect a specific request — its cost,

**TechyMT**

- `system-boundaries` — Teaches what Claude Code owns vs. what it delegates: the Claude API for LLM inference, MCP servers for dynamic tool/resource extension, the file syste

**Docker**

- `docker-agent-run` — Use this skill when running a Docker Agent with `docker agent run`, choosing a safety/approval mode, using the `--sandbox` isolation flag, setting up 

**Resend**

- `resend` — Use when working with the Resend email API — sending transactional emails (single or batch), receiving inbound emails via webhooks, managing email tem

**Svelte**

- `writing-great-skills` — Reference for writing and editing skills well — the vocabulary and principles that make a skill predictable.

**Vercel Labs**

- `deploy-to-vercel` — Deploy applications and websites to Vercel. Use when the user requests deployment actions like "deploy my app", "deploy and give me the link", "push t

## api-integrations (56)


**PostHog**

- `creating-an-endpoint` — Create a PostHog endpoint with the right shape on the first try — covers query kind choice, name conventions, what to expose as variables (HogQL code_
- `diagnosing-sdk-health` — Diagnoses the health of a project's PostHog SDK integrations — which SDKs are out of date and how to fix them. Use when a user asks about PostHog SDK 
- `feature-flags-api` — PostHog feature flags for API applications
- `feature-flags-api` — PostHog feature flags for API applications
- `instrument-integration` — Add PostHog SDK integration to your application. Use when setting up PostHog for the first time or reviewing PRs that need PostHog initialization. Cov
- `integration-android` — PostHog integration for Android applications
- `integration-android` — PostHog integration for Android applications
- `integration-angular` — PostHog integration for Angular applications
- `integration-angular` — PostHog integration for Angular applications
- `integration-astro-hybrid` — PostHog integration for Astro hybrid rendering with both static and server-rendered pages
- `integration-astro-hybrid` — PostHog integration for Astro hybrid rendering with both static and server-rendered pages
- `integration-astro-ssr` — PostHog integration for server-rendered Astro applications with API routes
- `integration-astro-ssr` — PostHog integration for server-rendered Astro applications with API routes
- `integration-astro-static` — PostHog integration for static Astro sites using SSG
- `integration-astro-static` — PostHog integration for static Astro sites using SSG
- `integration-django` — PostHog integration for Django applications
- `integration-django` — PostHog integration for Django applications
- `integration-expo` — PostHog integration for Expo applications
- `integration-expo` — PostHog integration for Expo applications
- `integration-fastapi` — PostHog integration for FastAPI applications
- `integration-fastapi` — PostHog integration for FastAPI applications
- `integration-flask` — PostHog integration for Flask applications
- `integration-flask` — PostHog integration for Flask applications
- `integration-javascript_node` — PostHog integration for server-side Node.js applications using posthog-node
- `integration-javascript_node` — PostHog integration for server-side Node.js applications using posthog-node
- `integration-javascript_web` — PostHog integration for client-side web JavaScript applications using posthog-js
- `integration-javascript_web` — PostHog integration for client-side web JavaScript applications using posthog-js
- `integration-laravel` — PostHog integration for Laravel applications
- `integration-laravel` — PostHog integration for Laravel applications
- `integration-python` — PostHog integration for any Python application using the Python SDK
- `integration-python` — PostHog integration for any Python application using the Python SDK
- `integration-ruby` — PostHog integration for any Ruby application using the Ruby SDK
- `integration-ruby` — PostHog integration for any Ruby application using the Ruby SDK
- `integration-ruby-on-rails` — PostHog integration for Ruby on Rails applications
- `integration-ruby-on-rails` — PostHog integration for Ruby on Rails applications
- `integration-sveltekit` — PostHog integration for SvelteKit applications
- `integration-sveltekit` — PostHog integration for SvelteKit applications
- `integration-swift` — PostHog integration for Swift iOS and macOS applications
- `integration-swift` — PostHog integration for Swift iOS and macOS applications
- `integration-tanstack-start` — PostHog integration for TanStack Start full-stack applications
- … +5 more (see registry.jsonl)

**OpenRouter**

- `open-responses` — This skill should be used when implementing, consuming, or debugging an Open Responses-compliant API — the open standard for multi-provider LLM intero
- `openrouter-images` — Generate images from text prompts and edit existing images using OpenRouter's dedicated Image API. Use when the user asks to create, generate, or make
- `openrouter-stt` — Transcribe speech to text using OpenRouter's speech-to-text API. Use when the user asks to transcribe audio, convert speech to text, extract a transcr
- `openrouter-tts` — Generate speech audio from text using OpenRouter's text-to-speech API. Use when the user asks to synthesize speech, narrate text, create a voiceover, 

**Twilio**

- `twilio-lookup-phone-intelligence` — Look up phone number intelligence via Twilio Lookup v2 API. Covers number validation, line type detection (mobile/landline/VoIP), SIM swap detection, 
- `twilio-voice-outbound-calls` — Make outbound phone calls via Twilio's Programmable Voice REST API. Covers the full voice platform: calls.create(), answering machine detection (AMD),
- `twilio-whatsapp-manage-senders` — Create, configure, and manage WhatsApp Business senders via Twilio's Channels Senders API. Covers programmatic sender registration, profile setup, web

**HuggingFace**

- `huggingface-datasets` — Use this skill for Hugging Face Dataset Viewer API workflows that fetch subset/split metadata, paginate rows, search text, apply filters, download par
- `trl-training` — Post-train LLMs with TRL (Transformers Reinforcement Learning) — SFT, DPO, GRPO, KTO, and reward-model training. Use when writing or debugging trainin

**TanStack**

- `tanstack-integration-best-practices` — Best practices for integrating TanStack Query with TanStack Router and TanStack Start. Patterns for full-stack data flow, SSR, and caching coordinatio

**Firecrawl**

- `firecrawl-alexandria` — Find a direct path to structured data through ready-made workflows, data APIs, and indexes. Follow the search skill to discover and inspect tools, the

## growth-marketing (15)


**Firecrawl**

- `firecrawl-crawl` — Bulk-extract many pages from one site or section. Use for "crawl", "everything under /docs", or content spanning linked pages.
- `firecrawl-download` — Save a site or section as local files (markdown, screenshots). Use for "download the site", offline docs, or a local copy for reference.
- `firecrawl-parse` — Convert a local file (PDF, DOCX, XLSX, HTML, …) to markdown, or answer questions about its content. Use whenever the input is a file path, not a URL.
- `firecrawl-scrape` — Read a known webpage or execute a discovered workflow or data-provider capability. Use for page content or structured results once the URL or tool is 

**Trail of Bits**

- `coverage-analysis` — Measures and interprets what a fuzzing campaign actually reaches, using llvm-cov, lcov, or a fuzzer's own coverage output. Covers baselining a new cam
- `goal-prompt` — Drafts copy-paste-ready /goal commands for goal mode in Claude Code and Codex. Use when the user asks to create, write, rewrite, improve, compress, cl
- `regression-hunt` — Use when investigating regressions in PRs or commits, coordinating a regression campaign, or resuming saved progress.

**Anthropic**

- `algorithmic-art` — Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code
- `pptx` — Use this skill any time a .pptx or .potx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or

**wshobson**

- `competitive-landscape` — Analyze competition, identify differentiation opportunities, and develop winning market positioning strategies using Porter's Five Forces, Blue Ocean 
- `file-conversion` — Use when the user needs a local file converted between common image, audio, video, document, or data formats. Select installed tools, preserve origina

**PostHog**

- `user-deep-dive` — Deep dive on a PostHog user by email address. Analyze what they do, where they spend time, and what products they use.

**Corey Haines**

- `events` — When the user wants to plan, run, sponsor, speak at, or get pipeline from events — webinars, conferences, trade shows, meetups, dinners, workshops, vi

**HuggingFace**

- `huggingface-local-models` — Use to select models to run locally with llama.cpp and GGUF on CPU, Mac Metal, CUDA, or ROCm. Covers finding GGUFs, quant selection, running servers, 

**MongoDB**

- `review-skill` — Review a proposed Agent Skill for structural validity and content quality before publishing. Runs the skill-validator CLI to check for structural issu

## engineering-process (29)


**PostHog**

- `context-layer-health-check` — Reviews context wiki quality after deterministic consolidation. Use when recent wiki-miss entries, contradictory or unsupported claims, stale prioriti
- `instrument-feature-flags` — Add PostHog feature flags to gate new functionality. Use after implementing features or reviewing PRs to ensure safe rollouts with feature flag contro
- `instrument-product-analytics` — Add PostHog product analytics events to track user behavior. Use after implementing new features or reviewing PRs to ensure meaningful user actions ar
- `omnibus-instrument-feature-flags` — Add PostHog feature flags to gate new functionality. Use after implementing features or reviewing PRs to ensure safe rollouts with feature flag contro
- `omnibus-instrument-feature-flags` — Add PostHog feature flags to gate new functionality. Use after implementing features or reviewing PRs to ensure safe rollouts with feature flag contro
- `omnibus-instrument-llm-analytics` — Add PostHog LLM analytics to trace AI model usage. Use after implementing LLM features or reviewing PRs to ensure all generations are captured with to
- `omnibus-instrument-llm-analytics` — Add PostHog LLM analytics to trace AI model usage. Use after implementing LLM features or reviewing PRs to ensure all generations are captured with to
- `omnibus-instrument-product-analytics` — Add PostHog product analytics events to track user behavior. Use after implementing new features or reviewing PRs to ensure meaningful user actions ar
- `omnibus-instrument-product-analytics` — Add PostHog product analytics events to track user behavior. Use after implementing new features or reviewing PRs to ensure meaningful user actions ar
- `review-hog-blind-spots-general` — Checks each chunk for issues the other reviewers missed. Uses their findings to avoid repeating them.
- `review-hog-resolution-criteria` — Implements safe, verifiable fixes from review comments. Explains declined requests and asks a human to handle risky changes.
- `reviewing-warehouse-suggestions` — Reviews PostHog's warehouse suggestions with a person and acts on them. Explains why a view should be materialized, unmaterialized, certified or depre

**wshobson**

- `code-review-excellence` — Master effective code review practices to provide constructive feedback, catch bugs early, and foster knowledge sharing while maintaining team morale.
- `context-driven-development` — Creates and maintains project context artifacts (product.md, tech-stack.md, workflow.md, tracks.md) in a `conductor/` directory. Scaffolds new project
- `multi-reviewer-patterns` — Coordinate parallel code reviews across multiple quality dimensions with finding deduplication, severity calibration, and consolidated reporting. Use 
- `protocol-reverse-engineering` — Master network protocol reverse engineering including packet analysis, protocol dissection, and custom protocol documentation. Use when analyzing netw
- `scan` — Scans the codebase to generate project-doc.md and AGENTS.md. Use when bootstrapping a new agent-driven repo, refreshing project documentation after ar
- `vision-sft` — Fine-tune vision-language models (VLMs) with supervised learning on image+text data. Use when adapting a VLM to a visual domain or task, configuring f
- `workflow-patterns` — Use this skill when implementing tasks according to Conductor's TDD workflow, handling phase checkpoints, managing git commits for tasks, or understan

**Svelte**

- `svelte-code-writer` — CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (`.svelte`) o
- `svelte-code-writer` — CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (`.svelte`) o
- `svelte-code-writer` — CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (`.svelte`) o
- `svelte-code-writer` — CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (`.svelte`) o

**Trail of Bits**

- `dwarf-expert` — Analyzes DWARF debug information in compiled binaries. Use when inspecting .debug_* sections, DIE trees, or DW_TAG_/DW_AT_ entries with dwarfdump/llvm
- `patching-bugs` — Use when a known bug or falsifiable bug hypothesis in a local codebase needs a patch commit and reviewable proof report.
- `second-opinion` — Gets independent code reviews from Codex or Antigravity for uncommitted changes, branch diffs, and commits. Use when the user requests an external rev

**Firecrawl**

- `firecrawl-shop` — Researches products across retailers and review sites with Firecrawl and recommends what to buy within the user's budget and preferences, with current

**HuggingFace**

- `hf-mcp` — Use Hugging Face Hub via MCP server tools. Search models, datasets, Spaces, papers. Get repo details, fetch documentation, run compute jobs, and use G

**Superpowers**

- `using-git-worktrees` — Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace ex

## python-backend (7)


**wshobson**

- `python-anti-patterns` — Use this skill when reviewing Python code for common anti-patterns to avoid. Use as a checklist when reviewing code, before finalizing implementations
- `python-code-style` — Python code style, linting, formatting, naming conventions, and documentation standards. Use when writing new code, reviewing style, configuring linte
- `python-packaging` — Create distributable Python packages with proper project structure, setup.py/pyproject.toml, and publishing to PyPI. Use when packaging Python librari
- `python-type-safety` — Python type safety with type hints, generics, protocols, and strict type checking. Use when adding type annotations, implementing generic classes, def

**PostHog**

- `feature-flags-python` — PostHog feature flags for Python applications
- `feature-flags-python` — PostHog feature flags for Python applications

**Trail of Bits**

- `modern-python` — Configures Python projects with modern tooling (uv, ruff, ty). Use when creating projects, writing standalone scripts, or migrating from pip/Poetry/my

## mobile (6)


**PostHog**

- `feature-flags-android` — PostHog feature flags for Android applications
- `feature-flags-android` — PostHog feature flags for Android applications
- `feature-flags-ios` — PostHog feature flags for iOS applications
- `feature-flags-ios` — PostHog feature flags for iOS applications
- `instrument-metrics` — Add PostHog metric capture to track counters, gauges, and histograms. Use after implementing features or reviewing PRs to ensure key operations are me

**Expo**

- `expo-router` — Navigation and routing for Expo Router. Covers file-based routes, groups and dynamic routes, folder organization, Link with previews and context menus

## other (66)


**PostHog**

- `checking-member-access` — Explains what a member or a role can do in a PostHog project, using the access control MCP tools. Use when the user asks what someone can see or edit,
- `context-layer-dreaming` — Synthesizes recent organizational activity into a durable context wiki. Use when running a nightly or incremental context-layer dream, or when updatin
- `feature-flags-dotnet` — PostHog feature flags for .NET applications
- `feature-flags-dotnet` — PostHog feature flags for .NET applications
- `feature-flags-elixir` — PostHog feature flags for Elixir applications
- `feature-flags-elixir` — PostHog feature flags for Elixir applications
- `feature-flags-flutter` — PostHog feature flags for Flutter applications
- `feature-flags-flutter` — PostHog feature flags for Flutter applications
- `feature-flags-go` — PostHog feature flags for Go applications
- `feature-flags-go` — PostHog feature flags for Go applications
- `feature-flags-java` — PostHog feature flags for Java applications
- `feature-flags-java` — PostHog feature flags for Java applications
- `feature-flags-nodejs` — PostHog feature flags for Node.js applications
- `feature-flags-nodejs` — PostHog feature flags for Node.js applications
- `feature-flags-php` — PostHog feature flags for PHP applications
- `feature-flags-php` — PostHog feature flags for PHP applications
- `feature-flags-ruby` — PostHog feature flags for Ruby applications
- `feature-flags-ruby` — PostHog feature flags for Ruby applications
- `feature-flags-rust` — PostHog feature flags for Rust applications
- `feature-flags-rust` — PostHog feature flags for Rust applications
- `feature-flags-web` — PostHog feature flags for Web (JavaScript) applications
- `feature-flags-web` — PostHog feature flags for Web (JavaScript) applications
- `installing-posthog-from-chat` — Set up PostHog in a user's GitHub repository from a chat, without a terminal. Wizard, PostHog's setup agent, runs in the cloud, adds the SDK and first
- `investigate-metric` — Diagnose why a product metric changed (dropped, spiked, or plateaued) by orchestrating breakdowns, actors, paths, lifecycle, retention, and annotation
- `llm-analytics-setup` — PostHog LLM analytics for all supported providers
- `llm-analytics-setup` — PostHog LLM analytics for all supported providers
- `signals-scout-anomaly-detection` — Signals scout that watches the project's most-viewed dashboards and insights for anomalies — bursts, drops, flat-lines, and trend breaks — against eac
- `signals-scout-customer-analytics` — Signals scout for PostHog Customer analytics (Accounts). Watches per-account engagement for churn-risk shapes — engagement cliffs, dormancy, champion 
- `signals-scout-feature-flags` — Signals scout for PostHog feature flags. Watches the flag roster and the `$feature_flag_called` stream for evaluation cliffs, ghost flags, response-di
- `signals-scout-first-report` — Runs once after Self-Driving activation to find one valuable, actionable finding in a project's existing product and warehouse data.
- `signals-scout-inbox-validation` — Follow-up Signals scout for the inbox itself. Attaches a check to each newly resolved report, spot-checks a couple of settled fixes with fresh probes,
- `signals-scout-insight-alerts` — Signals scout over the project's configured insight alerts. Reads each alert's recent firing history and surfaces the firings a human likely missed.
- `signals-scout-mcp-tool-calls` — Signals scout for PostHog MCP tool calls. Watches `$mcp_tool_call` telemetry for tools that need improvement — broad-reach failure rates, retry hammer
- `signals-scout-product-analytics` — Signals scout for core product-analytics flows — funnels, retention, lifecycle, stickiness, and paths. Watches the team's saved flows for a derived-ra
- `signals-scout-surveys` — Signals scout for PostHog surveys. Watches active surveys for score regressions, response- volume drops, abandonment spikes, and targeting drift, and 
- `signals-scout-unused-features` — Signals scout for the parts of a product people barely use. Measures each clickable element and page against the reach of where it lives, gives each b
- `skills-store` — Discover and use shared team skills stored in PostHog. Use when the user asks to list, browse, load, or manage "shared skills", "team skills", or refe
- `tools-and-features-hogql` — HogQL queries for PostHog analytics
- `tools-and-features-hogql` — HogQL queries for PostHog analytics
- `working-with-task-comments` — Read and use comments attached to the current PostHog task, its artifacts, and any canvas through the PostHog MCP exec dispatcher. Use when the user m
- … +1 more (see registry.jsonl)

**Trail of Bits**

- `chrome-mcp-troubleshooting` — Diagnose and fix Claude in Chrome MCP extension connectivity issues. Use when mcp__claude-in-chrome__* tools fail, return "Browser extension is not co
- `hunt-regressions` — Use when discovering possible regressions from a pinned change and its callers before reproduction.
- `prepare-regression` — Use when pinning before/after sources and collecting PR or commit context for a regression investigation.
- `reproduce-bug` — Use when a named runtime or compiler bug in a local repository needs independent reproduction.
- `validate-bug` — Use when a bug PoC package needs an independent rerun and judgment before patching.

**wshobson**

- `block-no-verify-hook` — Configure a PreToolUse hook to prevent AI agents from skipping git pre-commit hooks with --no-verify and other bypass flags. Use when setting up Claud
- `dataset-curation` — Prepare, format, and validate datasets for supervised fine-tuning and preference training. Use when converting raw data into training format, applying
- `grounded-vault` — Use when maintaining a durable Markdown knowledge store that agents compile from sources, when every number or quote in a wiki page must trace back to
- `mtls-configuration` — Configure mutual TLS (mTLS) for zero-trust service-to-service communication. Use when implementing zero-trust networking, certificate management, or s
- `spark-training-gotchas` — Preflight and diagnose the ten known failure modes for ML training on NVIDIA DGX Spark. Use when a training run on DGX Spark fails to start, OOMs belo

**HuggingFace**

- `huggingface-community-evals` — Run evaluations for Hugging Face Hub models using inspect-ai and lighteval on local hardware. Use for backend selection, local GPU evals, and choosing
- `train-sentence-transformers` — Train or fine-tune sentence-transformers models across `SentenceTransformer` (bi-encoder, dense or static embedding model for retrieval, similarity, c
- `transformers-js` — Use Transformers.js to run state-of-the-art machine learning models directly in JavaScript/TypeScript. Supports NLP (text classification, translation,

**antfu**

- `antfu` — Anthony Fu's opinionated tooling and conventions for JavaScript/TypeScript projects. Use when setting up new projects, configuring ESLint/Prettier alt
- `unocss` — UnoCSS instant atomic CSS engine, superset of Tailwind CSS. Use when configuring UnoCSS, writing utility rules, shortcuts, or working with presets lik

**Anthropic**

- `pdf` — Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging 
- `template-skill` — Replace with description of the skill and when Claude should use it.

**Firecrawl**

- `firecrawl-job-postings` — Find current job postings on employer career pages and job boards. Use when the user asks who's hiring, seeks remote or local jobs, or wants openings 
- `firecrawl-map` — Discover and list a site's URLs, with search filtering. Use for "map the site" or "find the URL for" requests — when the user knows the site but not t

**OpenRouter**

- `openrouter-typescript-sdk` — Complete reference for integrating with 300+ AI models through the OpenRouter TypeScript SDK and Agent packages using the callModel pattern

**TechyMT**

- `naming-conventions` — Teaches Claude Code's naming system: Tool files are [Name]Tool.ts[x], commands use kebab-case, types are PascalCase, functions start with verbs in cam

**Callstack**

- `validate-skills` — Validates skills in this repo against agentskills.io spec and Claude Code best practices. Use via /validate-skills command.

**Neon**

- `score-eval` — 

**Svelte**

- `svelte-mcp-feedback` — Report Svelte MCP autofixer opportunities when the user corrects a Svelte or SvelteKit mistake the agent made. Use after corrections to .svelte compon

**Twilio**

- `twilio-agent-connect` — 
