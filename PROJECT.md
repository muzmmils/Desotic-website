# Project: Infinite Healthy Yumm / Desotiq Platform

## Architecture

- **Framework**: TanStack Start (Nitro SSR `cloudflare-module` preset) + React 19 + TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite) + Theme Tokens (OKLCH palette: brand orange, emerald green, neutral card backgrounds)
- **Data & Auth Layer**: `@supabase/ssr` (browser singleton + server cookie bridge), Supabase PostgreSQL database with RLS policies, triggers, and Realtime publication
- **State Management**:
  - Server state: `@tanstack/react-query` v5 with optimistic queries and offline resilient fallback to `mockData.ts`
  - Client state: `zustand` v5 cart store with persistent localStorage and React 19 hydration guard
  - Forms: `react-hook-form` + `@hookform/resolvers` + `zod`
- **Security & Reliability**: Content Security Policy in `src/server.ts`, Sentry error monitoring, Framer Motion LazyMotion optimization, GitHub Actions CI
- **Edge Functions**: `create-order`, `verify-payment`, `subscription-cycle` with mock/live payment simulation

## Feature Inventory

| #   | Feature                                     | Description                                                                                                                          | Milestone | Source              |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------- |
| 1   | Prettier Format & Clean Lint                | Fix 18 formatting errors in `mockData.ts` to ensure 0 lint errors                                                                    | M1        | survey_codebase     |
| 2   | Enhanced DB Schema & Realtime               | Database migration SQL for 7 core tables + Supabase Realtime publication on `orders`                                                 | M1        | survey_architecture |
| 3   | Supabase SSR Client & Cookies               | `@supabase/ssr` browser and server clients with request cookies synchronization                                                      | M1        | survey_architecture |
| 4   | Zod Schemas & DB Types                      | Validation schemas for auth, profile, orders, and subscriptions; matching TypeScript types                                           | M1        | survey_architecture |
| 5   | Auth Routes & Session Flow                  | `/login`, `/signup`, `/account` profile & address editing, protected route guard                                                     | M1        | survey_architecture |
| 6   | SiteHeader Auth & Nav Integration           | Reactive user avatar/name, logout dropdown, links to all pages, cart badge counter                                                   | M1        | survey_specs        |
| 7   | Menu Catalog Page (`/menu`)                 | Search by query, category filter tabs, dietary pills (Vegan, Gluten-free, High-Protein), sorting                                     | M2        | survey_architecture |
| 8   | Product Detail Page (`/menu/$itemId`)       | Dynamic route with nutritional facts visualizer (macros & calories), ingredients, allergen warnings, add-to-cart                     | M2        | survey_architecture |
| 9   | React Query Menu Hooks                      | `useMenuItems`, `useMenuItem`, `useCategories` with cache invalidation and mock fallback                                             | M2        | survey_architecture |
| 10  | Dynamic Sitemap Generation                  | `src/routes/sitemap[.]xml.ts` dynamically including all menu items and static routes                                                 | M2        | survey_architecture |
| 11  | Zustand Cart Store                          | Persistent cart store (`useCartStore`) with add, remove, update quantity, hydration safety                                           | M3        | survey_architecture |
| 12  | Cart & Checkout Page (`/cart`)              | Line items list, order summary, Pune address form (`41xxxx` validation), 3-slot delivery picker                                      | M3        | survey_architecture |
| 13  | Edge Functions & Payment                    | `create-order` and `verify-payment` Edge Functions supporting Razorpay + dev mock payment                                            | M3        | survey_architecture |
| 14  | Realtime Order Tracking (`/order/$orderId`) | Live visual status stepper (pending -> confirmed -> preparing -> out_for_delivery -> delivered) powered by Supabase Realtime         | M3        | survey_architecture |
| 15  | Customer Order History (`/orders`)          | Customer dashboard displaying historical orders with status badges and re-order button                                               | M3        | survey_architecture |
| 16  | Subscription Plans Page (`/subscriptions`)  | 3 tiered plans (Starter, Power, Ultimate), frequency toggles, goal selection (Weight Loss, Keto, Vegan, etc.), calorie target picker | M4        | survey_specs        |
| 17  | Subscription Checkout Flow                  | Multi-step subscription creation with Pune pincode validation and payment simulation                                                 | M4        | survey_specs        |
| 18  | Account Subscription Dashboard              | Embedded inside `/account` with active plan status badge, renewal date, pause/resume/cancel modal                                    | M4        | survey_specs        |
| 19  | Landing Page Subscription CTA               | Interactive subscription banner in `src/routes/index.tsx` linking to `/subscriptions`                                                | M4        | survey_specs        |
| 20  | Subscription Webhooks/Edge Function         | Recurring billing cycle simulation and status transition processor                                                                   | M4        | survey_specs        |
| 21  | Content Security Policy Headers             | Strict CSP headers, X-Frame-Options, X-Content-Type-Options in `src/server.ts`                                                       | M5        | survey_specs        |
| 22  | Sentry Error Monitoring                     | `@sentry/react` integration in `src/router.tsx` and client with graceful offline fallback                                            | M5        | survey_specs        |
| 23  | Framer Motion LazyMotion Optimization       | Replace heavy `motion.*` with `LazyMotion` and `m.*` reducing bundle size                                                            | M5        | survey_specs        |
| 24  | About & Brand Story Page (`/about`)         | Brand philosophy, Moshi cafe location story, sustainability commitment, Schema.org JSON-LD                                           | M5        | survey_specs        |
| 25  | GitHub Actions CI Workflow                  | `.github/workflows/ci.yml` with automated dependency check, linting, and build verification                                          | M5        | survey_specs        |
| 26  | Full Project Verification & Audit           | Strict zero-error verification of `npm run build`, `npm run lint`, and forensic audit                                                | M6        | ORIGINAL_REQUEST    |

## Milestones

| #   | Name                          | Scope                                                                                            | Dependencies | Status  |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------ | ------------ | ------- |
| M1  | Phase 2: Auth & Data Layer    | Features 1-6 (format lint, enhanced schema SQL, SSR client, types, Zod, auth routes, SiteHeader) | none         | DONE    |
| M2  | Phase 3: Menu & Product Pages | Features 7-10 (/menu catalog, /menu/$itemId, React Query hooks, dynamic sitemap)                 | M1           | DONE    |
| M3  | Phase 4: Cart & Checkout      | Features 11-15 (zustand, /cart checkout, Edge Functions, /order/$orderId realtime, /orders)      | M1, M2       | PLANNED |
| M4  | Phase 5: Subscription System  | Features 16-20 (/subscriptions, plan picker, /account dashboard, landing CTA, webhooks)          | M1, M3       | PLANNED |
| M5  | Phase 6: Production Hardening | Features 21-25 (CSP headers, Sentry, LazyMotion, /about, GitHub Actions CI)                      | M1-M4        | PLANNED |
| M6  | Final Verification & Audit    | Feature 26 (Pass npm run build, npm run lint with 0 errors, comprehensive forensic audit)        | M1-M5        | PLANNED |

## Interface Contracts

### Auth & User Profile Contract

- `supabase.auth.getUser()` returns `{ user: User | null }`
- Profiles table: `profiles(id uuid PK, full_name text, phone text, avatar_url text, address jsonb)`
- `useAuth()` hook exposes `{ user, profile, loading, signOut }`

### Menu & Catalog Contract

- Category interface: `{ id: string, name: string, slug: string, description: string, emoji: string, image_url?: string }`
- MenuItem interface: `{ id: string, category_id: string, name: string, slug: string, description: string, price: number, image_url: string, calories: number, protein_g: number, carbs_g: number, fat_g: number, fiber_g?: number, is_vegan: boolean, is_gluten_free: boolean, is_available: boolean, tags: string[], ingredients: string[], customization_options?: any[] }`
- React Query keys: `['categories']`, `['menu-items', filters]`, `['menu-item', idOrSlug]`

### Cart & Checkout Contract

- Cart store `useCartStore`: `{ items: CartItem[], addItem: (item, qty, customization) => void, removeItem: (itemId) => void, updateQuantity: (itemId, qty) => void, clearCart: () => void, subtotal: () => number, deliveryFee: () => number, total: () => number }`
- Order model: `{ id: string, order_number: string, user_id?: string, total: number, status: order_status, payment_status: payment_status, delivery_address: Address, delivery_slot: 'morning' | 'lunch' | 'dinner', items: OrderItem[] }`
- Edge Function `create-order`: `POST /functions/v1/create-order` -> `{ order_id, order_number, amount, razorpay_order_id }`
- Realtime channel: `supabase.channel('order-tracking-${orderId}').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: 'id=eq.${orderId}' }, callback)`

### Subscription System Contract

- Subscription plans: Starter (3 meals/wk), Power (5 meals/wk), Ultimate (7 meals/wk)
- Subscription model: `{ id: string, user_id: string, plan_id: string, status: 'active' | 'paused' | 'cancelled' | 'past_due', billing_cycle: 'monthly' | 'quarterly', goal: string, calorie_target: number, current_period_end: string, delivery_slot: string }`
- State machine: Active -> Paused (freeze period) -> Resumed (extend end date) -> Cancelled

### Production Hardening Contract

- Security headers in `src/server.ts`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- Sentry: initialized in `src/router.tsx` or client entry if `VITE_SENTRY_DSN` is present; silent no-op when missing
- Framer Motion: `<LazyMotion features={domAnimation} strict>` wrapping `<m.div>` components to reduce bundle

## Code Layout

- `src/components/`: Reusable UI components (SiteHeader, SiteFooter, CartDrawer, etc.)
- `src/routes/`: File-based routes for TanStack Router
  - `__root.tsx`: Root shell
  - `index.tsx`: Landing page
  - `login.tsx`: Login page
  - `signup.tsx`: Signup page
  - `account.tsx`: Profile & subscription dashboard
  - `menu.index.tsx`: Menu catalog
  - `menu.$itemId.tsx`: Product detail
  - `cart.tsx`: Cart and checkout
  - `order.$orderId.tsx`: Order realtime tracking
  - `orders.tsx`: Customer orders list
  - `subscriptions.tsx`: Subscription plans and onboarding
  - `about.tsx`: Brand story & Moshi cafe page
  - `sitemap[.]xml.ts`: Dynamic sitemap XML
- `src/stores/`: Zustand stores (`cartStore.ts`)
- `src/queries/`: React Query hooks
- `src/lib/`: Utilities, Supabase clients (`supabase-browser.ts`, `supabase-server.ts`), database types, Zod schemas (`schemas/`)
- `src/server.ts`: Nitro SSR entry with CSP headers
- `supabase/`: Migrations (`supabase/migrations/`) and seeds (`supabase/seed.sql`)
- `supabase/functions/`: Supabase Edge Functions (`create-order`, `verify-payment`, `subscription-cycle`)
- `.github/workflows/`: CI workflows (`ci.yml`)
