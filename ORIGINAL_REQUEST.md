# Original User Request

## 2026-09-12T11:15:48Z

Build and deliver the complete subscription-based healthy-food eCommerce and meal subscription platform for Infinite Healthy Yumm / Desotiq (Phases 2 through 6 of the approved implementation plan).

Working directory: d:\Projects\Desotiq Landing page
Integrity mode: development

Phase 1 is already completed and verified. You need to implement Phases 2 through 6:

- Phase 2: Auth & Data Layer (@supabase/ssr client, database migration SQL, seed data, TypeScript types, Zod schemas, /login, /signup, /account routes, SiteHeader)
- Phase 3: Menu & Product Pages (/menu with filters & search, /menu/$itemId product details, React Query hooks, dynamic sitemap)
- Phase 4: Cart & Checkout (Zustand cart store, /cart checkout with address and slot picker, Edge Functions for orders and payment verification, /order/$orderId realtime tracking, /orders history)
- Phase 5: Subscription System (/subscriptions plan selection, checkout flow, account subscription dashboard with pause/resume/cancel, webhook functions, landing page CTA)
- Phase 6: Production Hardening (CSP headers in server.ts, Sentry error monitoring, Framer Motion LazyMotion optimization, /about page, GitHub Actions CI)

Ensure npm run build and npm run lint pass with 0 errors. Preserve git history (no force push/rebase).
