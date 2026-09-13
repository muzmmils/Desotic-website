# Infinite Healthy Yumm / Desotiq Platform

## Architecture & Stack

- **Framework**: TanStack Start (SSR on Vite)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React, Framer Motion
- **State Management**: Zustand, TanStack Query
- **Backend & Database**: Supabase (@supabase/ssr, PostgreSQL, Edge Functions)
- **Deploy Target**: Cloudflare Pages / Workers (via Nitro)
- **Verification**: `npm run lint`, `npx tsc --noEmit`, `npm run build`

## UI & Animation Directives

- **Skill**: `.agents/skills/cinematic-scroll-ui/SKILL.md` and `.agents/skills/scroll-experience/SKILL.md` for scroll-driven, cinematic visual sections.
- **Rules**:
  - Animate only GPU properties (`transform`, `opacity`).
  - Use Framer Motion's `useScroll`, `useTransform`, and `useSpring` for smooth scroll synchronization.
  - Implement pinned story sections with sticky containers (`sticky top-0 h-screen`).
  - Always support reduced motion preferences with fallback accessibility styles.
