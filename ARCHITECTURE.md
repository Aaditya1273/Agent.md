# Agent.md — Production Architecture

> **Document Type:** Architecture & Implementation Guide
> **Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · PostgreSQL · Prisma · NextAuth.js · Cloudflare · Vercel · GitHub Actions · Docker · Redis · Object Storage (R2)
> **Last Updated:** 2026-07-19

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [API Layer Architecture](#5-api-layer-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Caching Architecture](#8-caching-architecture)
9. [File Storage & Downloads](#9-file-storage--downloads)
10. [Search Architecture](#10-search-architecture)
11. [Background Jobs & Queues](#11-background-jobs--queues)
12. [Rate Limiting](#12-rate-limiting)
    12.5 [WebSocket / Real-Time Strategy](#125-websocket--real-time-strategy)
13. [Error Handling](#13-error-handling)
14. [Logging & Monitoring](#14-logging--monitoring)
15. [SEO Architecture](#15-seo-architecture)
16. [Testing Strategy](#16-testing-strategy)
17. [CI/CD Pipeline](#17-cicd-pipeline)
18. [Feature Flags](#18-feature-flags)
19. [Deployment Architecture](#19-deployment-architecture)
20. [Security Architecture](#20-security-architecture)
21. [Performance Budgets](#21-performance-budgets)

---

## 1. Architecture Philosophy

### 1.1 Principles

**Feature-First, Not File-Type-First**
The folder structure follows product domains (presets, auth, search, admin), not technical layers (controllers, services, repositories). When a developer needs to work on "presets," they open one directory that contains routes, components, services, and tests for presets — not six different directories across the project.

**Co-location by Domain**
Everything related to a feature lives together: the route handler, the validation schema, the service function, the UI components, the tests. Shared infrastructure (db client, caching, auth middleware) lives in a `lib/` directory, but feature-specific code is never split across layers.

**Server-First Rendering**
All public pages render on the server (SSR/SSG). Client-side JavaScript is progressively enhanced, never required for initial render. This means the app works without JS for reading, but requires it for writing (downloads, reviews, preset creation).

**Bounded Contexts**
Each major domain (Presets, Users, Search, Admin, Analytics) operates independently with clear interfaces. This allows teams to work in parallel and enables future extraction into microservices without rewriting.

**Fail Closed**
Every external dependency (database, Redis, object storage, email) has a circuit breaker. If a dependency fails, the system degrades gracefully instead of crashing entirely.

### 1.2 Why These Technologies

| Technology | Decision Rationale |
|---|---|
| **Next.js 15 (App Router)** | Unified frontend + API layer reduces deployment complexity. App Router provides server components, streaming, and middleware natively. |
| **TypeScript** | Non-negotiable for a platform used by developers. Type safety across the full stack prevents entire categories of bugs. |
| **Tailwind CSS** | Utility-first enables consistent design without fighting specificity. Pairing with shadcn/ui gives us a component library we can own. |
| **shadcn/ui** | Not a dependency — it's copy-paste source code. Every component is ours to modify. No version hell, no breaking updates from upstream. |
| **Framer Motion** | Declarative animations that work with React Server Components via `use client` boundaries. The layout animations API is essential for our preset grid transitions. |
| **PostgreSQL** | The standard for production web apps. Full-text search, JSONB, and transactional integrity cover our needs without introducing additional infrastructure. |
| **Prisma** | Type-safe database client with migrations. The schema file serves as a single source of truth. No SQL injection surface. |
| **NextAuth.js** | The most battle-tested auth library for Next.js. Supports OAuth (GitHub, Google, Discord) and credentials with minimal configuration. |
| **Redis (Upstash)** | Serverless Redis compatible with Vercel Edge. Session cache, rate limiting counters, and hot cache for presets. No persistent connection overhead. |
| **Cloudflare R2** | S3-compatible object storage with zero egress fees. Perfect for preset ZIP archives and user avatars. Serves downloads via Cloudflare CDN. |
| **BullMQ + Redis** | Background job processing for ZIP generation, GitHub scanning, email delivery. Redis already in the stack — BullMQ is the natural choice. |
| **Vercel** | Native Next.js deployment with automatic ISR, Edge Functions, and preview deployments per branch. Zero DevOps overhead for the frontend. |
| **Docker** | Local development consistency. Production background workers run as Docker containers. CI/CD uses Docker for reproducible builds. |
| **GitHub Actions** | Already where the code lives. Self-hosted runners for Docker builds, GitHub-hosted for linting and testing. Matrix builds for parallel test execution. |

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Cloudflare CDN                                │
│                        (Static assets, ZIP downloads)                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              Vercel Edge Network                           │
│                    (Next.js ISR, Middleware, Edge Functions)                │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     Vercel Serverless Functions  │   │     Vercel Edge Functions    │
│      (API routes, SSR pages)     │   │  (Auth middleware, redirects) │
└───────────────────────────────┘   └───────────────────────────────┘
                    │                               │
                    ▼                               │
┌───────────────────────────────┐                  │
│     PostgreSQL (Neon/Supabase) │                  │
│     - Primary database        │                  │
│     - Read replicas           │                  │
└───────────────────────────────┘                  │
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     Redis (Upstash)            │   │     Cloudflare R2              │
│     - Session cache            │   │     - ZIP archives             │
│     - Rate limits              │   │     - User avatars             │
│     - Hot preset cache         │   │     - OG images                │
│     - Queue (BullMQ)           │   │     - Preset assets            │
└───────────────────────────────┘   └───────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────┐
│     Background Workers (Docker)│
│     - ZIP generation           │
│     - GitHub scanning          │
│     - Email delivery           │
│     - Analytics aggregation    │
│     - Plagiarism checks        │
└───────────────────────────────┘
```

### 2.2 Data Flow: Request Lifecycle

```
Request
  │
  ▼
Cloudflare CDN ─── cache hit ───› Serve cached response
  │
  ▼ (cache miss)
Vercel Edge Network
  │
  ▼
Middleware (Edge Function)
  ├── Parse session cookie (JWT)
  ├── Rate limit check (Redis)
  ├── Geo-locate (for download analytics)
  └── Attach user context to request
  │
  ▼
Route Handler (Serverless Function)
  ├── Authorize (role check)
  ├── Validate input (Zod schema)
  ├── Execute business logic
  │   ├── Read from Redis cache ─── hit ───› Return cached
  │   └── Miss ───› Read from PostgreSQL
  ├── Cache result in Redis (if appropriate)
  └── Return response
  │
  ▼
Client receives response
  ├── React Server Component renders HTML
  ├── Client components hydrate
  └── Streaming completed
```

### 2.3 Data Flow: Download Lifecycle

```
User clicks "Download"
  │
  ▼
API Route: /api/v1/presets/:id/download
  ├── Rate limit check
  │   ├── Anonymous: IP-based, 5/day ─── over? ───› 429
  │   └── Authenticated: Token-based, unlimited
  ├── Fetch preset metadata (DB)
  ├── Check for pre-generated ZIP in R2
  │   ├── Exists ───› Generate signed URL (1hr expiry) ───› Redirect
  │   └── Missing ───› Enqueue ZIP generation job (BullMQ)
  │                   ├── User waits for job completion
  │                   └── or: Return async URL with polling
  ├── Log download in `downloads` table
  ├── Increment `download_count` on preset
  └── Return download URL
  │
  ▼
User downloads ZIP from Cloudflare R2 (CDN edge)
```

---

## 3. Monorepo Structure

### 3.1 Package Topology

```
agentmd/
├── apps/
│   ├── web/                       # Next.js application (frontend + API)
│   └── docs/                      # Documentation site (Docusaurus)
│
├── packages/
│   ├── shared/                    # Shared TypeScript types, constants, validators
│   ├── database/                  # Prisma schema, migrations, seed
│   ├── preset-parser/             # Markdown preset parser & validator
│   ├── email/                     # Email templates (React Email)
│   ├── analytics/                 # Analytics aggregation logic
│   ├── ui/                        # Shared UI components (shadcn/ui based)
│   └── config/                    # Shared ESLint, TypeScript, Tailwind configs
│
├── services/                      # Background workers (Docker services)
│   ├── zip-generator/             # ZIP archive generation worker
│   ├── github-scanner/            # GitHub repository analyzer
│   ├── notification-sender/       # Email + in-app notification delivery
│   └── analytics-aggregator/      # Download analytics materialization
│
├── tooling/
│   ├── eslint-config/             # Shared ESLint configuration
│   ├── ts-config/                 # Shared TypeScript configuration
│   └── tailwind-config/           # Shared Tailwind CSS configuration
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Lint, typecheck, test
│   │   ├── deploy-preview.yml     # Vercel preview deployment
│   │   ├── deploy-production.yml  # Vercel production deployment
│   │   ├── docker-build.yml       # Build & push Docker images
│   │   └── migrate.yml            # Database migrations
│   └── actions/
│       └── setup/                 # Composite setup action
│
├── docker/
│   ├── Dockerfile.web             # Next.js container (for workers)
│   ├── Dockerfile.service         # Generic service container
│   └── docker-compose.yml         # Local development
│
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
└── package.json
```

### 3.2 Why This Structure

**`apps/web` as the primary application** — Next.js handles both frontend and API routes. This means a single deployment target (Vercel) for the main application. Background workers are separate because they need different scaling characteristics.

**`packages/shared`** — Centralizes types and validators used by both frontend and backend. The Prisma-generated types live here. Zod schemas for API validation live here. No type duplication between frontend and backend.

**`packages/database`** — Prisma schema and migrations are their own package because: (1) migrations should be run independently of app deploys, (2) the schema is consumed by both the web app and background workers, (3) seed scripts are useful for both local development and preview environments.

**`services/*` as separate packages** — These are long-running Docker containers that process background jobs. They share types via `packages/shared` and database access via `packages/database`. They don't share the Next.js bundle — they're independent processes.

**`packages/ui`** — UI components extracted from the web app into a shared package. This allows the docs site and any future micro-frontends to use the same design system without duplicating code.

### 3.3 Dependency Graph

```
apps/web ───› packages/shared
apps/web ───› packages/database
apps/web ───› packages/ui
apps/web ───› packages/config
apps/docs ───› packages/ui
apps/docs ───› packages/config

services/zip-generator ───› packages/shared
services/zip-generator ───› packages/database
services/github-scanner ───› packages/shared
services/github-scanner ───› packages/database
services/notification-sender ───› packages/shared
services/notification-sender ───› packages/database
services/notification-sender ───› packages/email
services/analytics-aggregator ───› packages/shared
services/analytics-aggregator ───› packages/database
services/analytics-aggregator ───› packages/analytics
```

---

## 4. Frontend Architecture

### 4.1 App Router Layout

```
src/app/
├── (marketing)/                   # Route group: public marketing pages
│   ├── layout.tsx                 # Minimal layout (header, footer)
│   ├── page.tsx                   # Homepage (SSG, revalidate: 3600)
│   ├── about/page.tsx
│   ├── roadmap/page.tsx
│   ├── contributing/page.tsx
│   └── license/page.tsx
│
├── (browse)/                      # Route group: browse & search
│   ├── layout.tsx                 # Browse layout (header, search bar, filter sidebar)
│   ├── presets/
│   │   ├── page.tsx               # Preset listing (SSR + SWR)
│   │   ├── loading.tsx            # Skeleton grid
│   │   ├── error.tsx              # Error boundary
│   │   └── [slug]/
│   │       ├── page.tsx           # Preset detail (SSR)
│   │       ├── loading.tsx
│   │       ├── not-found.tsx      # Custom 404 for deleted presets
│   │       ├── contents/page.tsx  # File contents tab
│   │       ├── versions/page.tsx  # Version history tab
│   │       └── reviews/
│   │           ├── page.tsx       # Reviews tab
│   │           └── actions.ts     # Server actions for reviews
│   ├── search/page.tsx            # Search results (client-side fetch)
│   └── compare/page.tsx           # Comparison (client-side fetch)
│
├── wizard/
│   ├── page.tsx                   # Recommendation wizard (client-side)
│   └── layout.tsx                 # Minimal wizard layout
│
├── (auth)/
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   └── callback/route.ts          # OAuth callback handler
│
├── (authenticated)/               # Route group: requires auth
│   ├── layout.tsx                 # Authenticated layout (sidebar + header)
│   ├── profile/
│   │   ├── page.tsx               # Public profile
│   │   ├── saved/page.tsx         # Saved presets
│   │   ├── collections/
│   │   │   ├── page.tsx           # Collection list
│   │   │   └── [id]/page.tsx      # Collection detail
│   │   ├── downloads/page.tsx     # Download history
│   │   └── settings/
│   │       ├── page.tsx           # Account settings
│   │       ├── api-keys/page.tsx  # API key management
│   │       └── notifications/page.tsx  # Notification preferences
│   └── dashboard/                 # Requires: Verified Maintainer+
│       ├── page.tsx               # Dashboard overview
│       ├── presets/
│       │   ├── page.tsx           # My presets
│       │   ├── new/page.tsx       # Create preset
│       │   └── [id]/edit/page.tsx # Edit preset
│       └── analytics/page.tsx     # Download analytics
│
├── admin/                         # Requires: Moderator+
│   ├── page.tsx                   # Admin dashboard
│   ├── pending/page.tsx           # Pending reviews
│   ├── presets/page.tsx           # All presets
│   ├── users/page.tsx             # User management
│   ├── reports/page.tsx           # Reports
│   ├── categories/page.tsx        # Manage taxonomy
│   └── settings/page.tsx          # System settings
│
└── api/                           # API routes
    ├── presets/
    │   ├── route.ts               # GET (list), POST (create)
    │   ├── [id]/route.ts          # GET, PUT, DELETE
    │   ├── [id]/download/route.ts # GET (download)
    │   └── [id]/reviews/route.ts  # GET, POST
    ├── auth/
    │   └── [...nextauth]/route.ts # NextAuth handler
    ├── search/route.ts            # GET (search)
    ├── users/
    │   ├── [id]/route.ts
    │   └── me/route.ts
    ├── collections/route.ts       # CRUD collections
    ├── upload/route.ts            # Preset file upload
    ├── wizard/recommend/route.ts  # Recommendation endpoint
    └── admin/
        ├── pending/route.ts
        ├── users/route.ts
        └── categories/route.ts
```

### 4.2 Rendering Strategy

| Page Pattern | Strategy | Rationale |
|---|---|---|
| **Homepage** | `SSG + ISR` (revalidate: 3600) | Static content, changes infrequently. ISR updates featured presets hourly. |
| **Preset List** | `SSR + client SWR` | SEO-critical. Initial SSR renders the first page; subsequent pages and filter changes fetch via SWR. Cached at CDN for 5 minutes. |
| **Preset Detail** | `SSR + ISR` (revalidate: 60) | SEO-critical. ISR ensures version bumps and review updates appear within 60 seconds without a full redeploy. |
| **Search Results** | `Client-side fetch` | No SEO value (search results are user-specific). Initial state loads from URL params, then fetches as user refines. |
| **Wizard** | `Client-side` | Highly interactive. No SEO value. All taxonomy data prefetched on first load. |
| **Dashboard** | `Client-side` | Authenticated, interactive. No SEO value. Server components for static parts, client for data tables. |
| **Admin** | `Client-side` | Authenticated, highly interactive. Server actions for mutations. |
| **Auth Pages** | `SSR` | SEO minimal but needs to handle redirects. Server-rendered forms for progressive enhancement. |
| **Profile** | `SSR + client SWR` | SEO for public profiles (shows user's presets). Client fetch for authenticated actions. |

### 4.3 Component Architecture

```
src/
├── components/
│   ├── ui/                        # Primitive components (shadcn/ui based)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── command.tsx            # Searchable combobox
│   │   ├── sheet.tsx              # Mobile slide-over
│   │   ├── tooltip.tsx
│   │   ├── avatar.tsx
│   │   └── separator.tsx
│   │
│   ├── layout/                    # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── app-shell.tsx
│   │   └── auth-guard.tsx         # Role-based route protection
│   │
│   ├── preset/                    # Domain: Preset
│   │   ├── preset-card.tsx
│   │   ├── preset-grid.tsx
│   │   ├── preset-hero.tsx
│   │   ├── preset-badges.tsx
│   │   ├── preset-file-tree.tsx
│   │   ├── preset-metrics.tsx
│   │   ├── preset-version-list.tsx
│   │   ├── preset-download-button.tsx
│   │   └── preset-comparison-checkbox.tsx
│   │
│   ├── search/                    # Domain: Search
│   │   ├── search-command.tsx     # Cmd+K palette
│   │   ├── search-input.tsx
│   │   ├── search-results.tsx
│   │   ├── search-filters.tsx
│   │   └── search-autocomplete.tsx
│   │
│   ├── wizard/                    # Domain: Wizard
│   │   ├── wizard-container.tsx
│   │   ├── wizard-step.tsx
│   │   ├── wizard-progress.tsx
│   │   ├── wizard-results.tsx
│   │   ├── option-card.tsx
│   │   └── wizard-store.ts       # Zustand store
│   │
│   ├── comparison/               # Domain: Comparison
│   │   ├── comparison-bar.tsx
│   │   ├── comparison-table.tsx
│   │   ├── comparison-row.tsx
│   │   └── comparison-store.ts
│   │
│   ├── reviews/                   # Domain: Reviews
│   │   ├── review-list.tsx
│   │   ├── review-card.tsx
│   │   ├── review-form.tsx
│   │   ├── review-actions.tsx     # Server actions
│   │   └── rating-display.tsx
│   │
│   ├── auth/                      # Domain: Authentication
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   ├── oauth-buttons.tsx
│   │   └── reset-password-form.tsx
│   │
│   ├── admin/                     # Domain: Admin
│   │   ├── admin-sidebar.tsx
│   │   ├── pending-queue.tsx
│   │   ├── user-table.tsx
│   │   ├── taxonomy-manager.tsx
│   │   └── admin-guard.tsx
│   │
│   ├── dashboard/                 # Domain: Dashboard
│   │   ├── preset-form.tsx        # Create/edit preset form
│   │   ├── file-uploader.tsx      # Drag-drop file upload
│   │   ├── analytics-chart.tsx
│   │   ├── analytics-overview.tsx
│   │   └── version-input.tsx
│   │
│   └── shared/                    # Shared components
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── loading-skeleton.tsx
│       ├── confirmation-dialog.tsx
│       ├── markdown-preview.tsx
│       ├── code-block.tsx
│       ├── file-icon.tsx
│       ├── stats-card.tsx
│       ├── page-header.tsx
│       ├── searchable-filter.tsx
│       ├── color-mode-toggle.tsx
│       ├── notification-bell.tsx
│       └── seo-head.tsx
```

### 4.4 Server Components vs Client Components

**Decision Rule:** A component is a Server Component by default. Only add `'use client'` when you need:
- Browser APIs (localStorage, IntersectionObserver)
- useState / useEffect
- Event handlers (onClick, onSubmit)
- Framer Motion animations
- Context providers

**Boundary pattern:**
```tsx
// preset-card.tsx — Server Component (default)
// Fetches data, renders static content
// Wraps interactive parts in client components

// preset-download-button.tsx — Client Component
'use client';
// Handles click, shows loading state, triggers download
```

**Pragmatic boundary strategy:**

Because shadcn/ui components like `Dialog`, `DropdownMenu`, and `Sheet` require `'use client'`, and preset cards need interactive elements (download, save, compare) but should SSR for SEO, we use a **thin client wrapper pattern**:

```tsx
// preset-card.tsx — Server Component
// This is the default export. Fetches data, renders the card.
// Only interactive elements are extracted into client components.

export async function PresetCard({ slug }: { slug: string }) {
  const preset = await getPresetPreview(slug);
  
  return (
    <Card>
      <PresetCardContent preset={preset} />       {/* Server: renders text, badges */}
      <PresetCardActions slug={slug} />            {/* Client: buttons */}
    </Card>
  );
}

// preset-card-actions.tsx — Client Component
// THIN wrapper — minimal JS, minimal re-renders
'use client';

export function PresetCardActions({ slug }: { slug: string }) {
  const [isSaving, setIsSaving] = useState(false);
  
  return (
    <div className="flex gap-2">
      <Button onClick={() => handleSave(slug)}>Save</Button>
      <DownloadButton slug={slug} />
      <CompareCheckbox slug={slug} />
    </div>
  );
}
```

This pattern limits client JavaScript to only the interactive parts, keeping the server-rendered HTML payload small and SEO-friendly. The client boundary is pushed to the leaves of the component tree, never the trunk.

### 4.5 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Server State (React Query)                 │
│  • Presets list, detail, versions                            │
│  • Search results                                            │
│  • User profile, collections, downloads                      │
│  • Reviews & ratings                                         │
│  • Admin data                                                │
│  • Cache: 5-60 minutes, stale-while-revalidate               │
├─────────────────────────────────────────────────────────────┤
│                  Client State (Zustand)                       │
│  • Comparison selections (persisted to localStorage)         │
│  • Wizard progress (persisted to localStorage)               │
│  • Active filters                                            │
│  • UI state (toasts, sidebar open, theme)                    │
├─────────────────────────────────────────────────────────────┤
│                     URL State (searchParams)                  │
│  • Search query (&q=)                                        │
│  • Active filters (&model=deepseek&task=saas)                │
│  • Pagination cursor                                         │
│  • Wizard step                                               │
│  • Compare IDs (&ids=a,b,c)                                  │
├─────────────────────────────────────────────────────────────┤
│                  Server State (Zustand)                       │
│  • Auth session (from NextAuth, available server-side)       │
│  • Form state (during preset creation/editing)               │
└─────────────────────────────────────────────────────────────┘

### 4.6 React Context Providers

Context providers wrap the application to share common state without prop drilling. Each provider is scoped to the minimal subtree that needs it.

```
Provider Tree (top to bottom)
├── SessionProvider         (NextAuth) — Auth session across all pages
│   ├── ThemeProvider       (next-themes) — Light/dark mode
│   │   ├── QueryProvider   (TanStack Query) — Server state management
│   │   │   ├── ToastProvider (shadcn/ui) — Toast notifications
│   │   │   │   └── App content
│   │   │   
│   │   // Route-group-scoped providers (loaded on demand):
│   │   ├── ComparisonProvider — Comparison selections (browse routes)
│   │   ├── WizardProvider     — Wizard step state (wizard routes)
│   │   └── FilterProvider     — Active filter state (browse routes)
```

**Design decisions:**
- `SessionProvider` wraps the entire app because auth state is needed everywhere.
- `ThemeProvider` wraps early to prevent flash of wrong theme.
- `QueryProvider` provides React Query context for all data fetching.
- Comparison, Wizard, and Filter providers mount only within their route groups — they are NOT global. This keeps the provider tree shallow and avoids unnecessary re-renders on unrelated pages.
- Providers that persist state (comparison, filters) use Zustand with localStorage — the Zustand store IS the provider layer, avoiding nested context hell.
- All providers use `'use client'` because they require React context. They are thin wrappers — no business logic, only setup.
```

---

## 5. API Layer Architecture

### 5.1 Route Handler Pattern

Every API route follows this structure:

```
src/app/api/{resource}/{action}/route.ts
├── Schema validation (Zod)
├── Authorization check (role-based)
├── Rate limit check
├── Business logic execution
├── Response formatting
└── Error boundary (try/catch → ApiError)
```

### 5.2 Route Handler Template

```typescript
// src/app/api/presets/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth/session';
import { rateLimit } from '@/lib/rate-limit';
import { ApiError, handleApiError } from '@/lib/errors';
import { presetService } from '@/lib/services/preset';
import { updatePresetSchema } from '@agentmd/shared/validators/preset';
import { AuditLog } from '@/lib/audit';

// --- GET /api/presets/[id] ---
// Public: anyone can view published presets
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const preset = await presetService.getById(params.id);
    if (!preset) {
      throw new ApiError(404, 'PRESET_NOT_FOUND', 'Preset not found');
    }
    return NextResponse.json({ success: true, data: preset });
  } catch (error) {
    return handleApiError(error);
  }
}

// --- PUT /api/presets/[id] ---
// Protected: only author or moderator+
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in required');

    // 2. Rate limit
    await rateLimit(`preset:update:${session.user.id}`, { limit: 10, window: 60 });

    // 3. Parse & validate body
    const body = await req.json();
    const data = updatePresetSchema.parse(body);

    // 4. Authorize (owner or moderator)
    const preset = await presetService.getById(params.id);
    if (!preset) throw new ApiError(404, 'PRESET_NOT_FOUND');
    if (preset.authorId !== session.user.id && !['moderator', 'admin'].includes(session.user.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    // 5. Execute
    const updated = await presetService.update(params.id, data);

    // 6. Audit log
    await AuditLog.create({
      actorId: session.user.id,
      action: 'preset.update',
      subjectType: 'preset',
      subjectId: params.id,
      metadata: { changes: Object.keys(data) },
    });

    // 7. Invalidate cache
    await redis.del(`preset:${params.id}`);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 5.3 Validation Architecture

```typescript
// packages/shared/src/validators/preset.ts
import { z } from 'zod';

export const createPresetSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).min(3).max(100),
  tagline: z.string().min(10).max(300),
  description: z.string().max(5000).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  license: z.enum(['MIT', 'Apache-2.0', 'GPL-3.0', 'CC-BY-4.0', 'CC0-1.0']).default('MIT'),
  modelIds: z.array(z.string().uuid()).min(1, 'At least one model required'),
  taskIds: z.array(z.string().uuid()).min(1),
  categoryIds: z.array(z.string().uuid()).min(1),
  designLanguageIds: z.array(z.string().uuid()).optional(),
  frameworkIds: z.array(z.string().uuid()).optional(),
});

export const updatePresetSchema = createPresetSchema.partial();

// Validation runs in schema-safe context
// All Zod schemas live in @agentmd/shared so both frontend forms
// and API routes validate against the same schemas.
```

### 5.4 Error Handling Architecture

```typescript
// src/lib/errors/index.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.flatten().fieldErrors,
        },
      },
      { status: 422 }
    );
  }

  // Log unexpected errors via structured logger (NOT console.error — 
  // console.error bypasses production log pipelines)
  logger({
    level: 'error',
    message: 'Unhandled API error',
    metadata: { error: error instanceof Error ? error.message : String(error) },
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

### 5.5 API Response Envelope

Every API response uses this shape:

```typescript
// Success
{
  "success": true,
  "data": T,
  "meta"?: {
    "cursor"?: string,
    "hasMore"?: boolean,
    "total"?: number
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details"?: {
      "name": ["String must contain at least 3 character(s)"],
      "slug": ["Slug already in use"]
    }
  }
}
```

---

## 6. Database Architecture

### 6.1 Prisma Schema Structure

```prisma
// packages/database/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pg_trgm, uuid_ossp]
}

// ─── Users ───

model User {
  id              String   @id @default(uuid()) @db.Uuid
  email           String   @unique
  passwordHash    String?
  displayName     String   @map("display_name")
  username        String   @unique
  avatarUrl       String?  @map("avatar_url")
  bio             String?
  role            Role     @default(USER)
  isVerified      Boolean  @default(false) @map("is_verified")
  githubId        String?  @unique @map("github_id")
  googleId        String?  @unique @map("google_id")
  discordId       String?  @unique @map("discord_id")
  emailVerifiedAt DateTime? @map("email_verified_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  presets         Preset[]
  reviews         Review[]
  collections     Collection[]
  downloads       Download[]
  savedPresets    SavedPreset[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  reports         Report[]          @relation("Reporter")
  resolvedReports Report[]          @relation("Resolver")
  maintainerProfile MaintainerProfile?
  apiKeys         ApiKey[]

  @@map("users")
}

enum Role {
  USER
  MAINTAINER
  MODERATOR
  ADMIN
}

// ─── Presets ───

model Preset {
  id              String      @id @default(uuid()) @db.Uuid
  authorId        String      @map("author_id") @db.Uuid
  name            String      @db.VarChar(200)
  slug            String      @unique @db.VarChar(250)
  tagline         String      @db.VarChar(300)
  description     String      @default("") @db.Text
  version         String      @default("1.0.0") @db.VarChar(20)
  license         String      @default("MIT") @db.VarChar(50)
  status          PresetStatus @default(DRAFT)
  isFeatured      Boolean     @default(false) @map("is_featured")
  isCurated       Boolean     @default(false) @map("is_curated")
  downloadCount   Int         @default(0) @map("download_count")
  averageRating   Decimal     @default(0.00) @map("average_rating") @db.Decimal(3, 2)
  reviewCount     Int         @default(0) @map("review_count")

  // Relations
  parentPresetId  String?     @map("parent_preset_id") @db.Uuid
  supersededById  String?     @map("superseded_by_id") @db.Uuid
  parentPreset    Preset?     @relation("PresetParent", fields: [parentPresetId], references: [id])
  supersededBy    Preset?     @relation("PresetSuperseded", fields: [supersededById], references: [id])
  children        Preset[]    @relation("PresetParent")
  author          User        @relation(fields: [authorId], references: [id])

  // Content
  files           PresetFile[]
  versions        PresetVersion[]

  // Taxonomy
  models          PresetModel[]
  tasks           PresetTask[]
  categories      PresetCategory[]
  designLanguages PresetDesignLanguage[]
  frameworks      PresetFramework[]

  // Community
  reviews         Review[]
  downloads       Download[]
  savedBy         SavedPreset[]

  // Timestamps
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  publishedAt     DateTime?   @map("published_at")
  archivedAt      DateTime?   @map("archived_at")
  deletedAt       DateTime?   @map("deleted_at")

  @@index([status])
  @@index([authorId])
  @@index([downloadCount(sort: Desc)])
  @@index([averageRating(sort: Desc)])
  @@index([publishedAt(sort: Desc)])
  @@index([isFeatured, status])
  @@map("presets")
}

enum PresetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  DEPRECATED
}

// ─── Preset Content ───

model PresetFile {
  id           String   @id @default(uuid()) @db.Uuid
  presetId     String   @map("preset_id") @db.Uuid
  filePath     String   @map("file_path") @db.VarChar(500)
  fileName     String   @map("file_name") @db.VarChar(255)
  content      String   @db.Text
  fileSizeBytes Int     @map("file_size_bytes")
  mimeType     String   @default("text/markdown") @map("mime_type")
  sortOrder    Int      @default(0) @map("sort_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  preset       Preset   @relation(fields: [presetId], references: [id], onDelete: Cascade)

  @@unique([presetId, filePath])
  @@index([presetId])
  @@map("preset_files")
}

model PresetVersion {
  id        String   @id @default(uuid()) @db.Uuid
  presetId  String   @map("preset_id") @db.Uuid
  version   String   @db.VarChar(20)
  changelog String?  @db.Text
  checksum  String?  @db.VarChar(64)
  isLatest  Boolean  @default(false) @map("is_latest")
  createdAt DateTime @default(now()) @map("created_at")
  preset    Preset   @relation(fields: [presetId], references: [id], onDelete: Cascade)

  @@unique([presetId, version])
  @@index([presetId])
  @@index([presetId, isLatest])
  @@map("preset_versions")
}

// ─── Taxonomy ───

model Model {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique @db.VarChar(50)
  name        String   @db.VarChar(100)
  description String?  @db.Text
  iconUrl     String?  @map("icon_url") @db.VarChar(500)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  presets     PresetModel[]

  @@map("models")
}

model Task {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique @db.VarChar(50)
  name        String   @db.VarChar(100)
  description String?  @db.Text
  iconUrl     String?  @map("icon_url") @db.VarChar(500)
  categoryId  String?  @map("category_id") @db.Uuid
  category    Category? @relation(fields: [categoryId], references: [id])
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  presets     PresetTask[]

  @@map("tasks")
}

// ─── Junction Tables ───

model PresetModel {
  presetId String @map("preset_id") @db.Uuid
  modelId  String @map("model_id") @db.Uuid
  preset   Preset @relation(fields: [presetId], references: [id], onDelete: Cascade)
  model    Model  @relation(fields: [modelId], references: [id], onDelete: Cascade)

  @@id([presetId, modelId])
  @@map("preset_models")
}

// ─── Reviews ───

model Review {
  id        String   @id @default(uuid()) @db.Uuid
  presetId  String   @map("preset_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  rating    Int      @db.SmallInt
  title     String?  @db.VarChar(200)
  content   String   @db.Text
  isEdited  Boolean  @default(false) @map("is_edited")
  isHidden  Boolean  @default(false) @map("is_hidden")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  preset    Preset   @relation(fields: [presetId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([presetId, userId])
  @@index([presetId])
  @@index([userId])
  @@map("reviews")
}

// ─── Collections ───

model Collection {
  id          String            @id @default(uuid()) @db.Uuid
  userId      String            @map("user_id") @db.Uuid
  name        String            @db.VarChar(100)
  description String?           @db.Text
  isPublic    Boolean           @default(false) @map("is_public")
  sortOrder   Int               @default(0) @map("sort_order")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       CollectionItem[]

  @@index([userId])
  @@map("collections")
}

model CollectionItem {
  id           String     @id @default(uuid()) @db.Uuid
  collectionId String     @map("collection_id") @db.Uuid
  presetId     String     @map("preset_id") @db.Uuid
  addedAt      DateTime   @default(now()) @map("added_at")
  sortOrder    Int        @default(0) @map("sort_order")
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  preset       Preset     @relation(fields: [presetId], references: [id], onDelete: Cascade)

  @@unique([collectionId, presetId])
  @@map("collection_items")
}

// ─── Downloads (Audit) ───

model Download {
  id              String   @id @default(uuid()) @db.Uuid
  presetId        String   @map("preset_id") @db.Uuid
  presetVersionId String?  @map("preset_version_id") @db.Uuid
  userId          String?  @map("user_id") @db.Uuid
  ipAddress       String?  @map("ip_address")
  userAgent       String?  @map("user_agent") @db.Text
  country         String?  @db.VarChar(2)    // ISO country code
  createdAt       DateTime @default(now()) @map("created_at")
  preset          Preset   @relation(fields: [presetId], references: [id], onDelete: Cascade)
  user            User?    @relation(fields: [userId], references: [id])

  @@index([presetId])
  @@index([userId])
  @@index([createdAt])
  @@map("downloads")
}

// ─── Notifications, Audit Logs, API Keys, etc. ───
// (truncated for brevity — see SPECIFICATION.md for full schema)
```

### 6.2 Migration Strategy

```yaml
# Migration workflow:
# 1. Developer modifies schema.prisma
# 2. `pnpm db:migrate dev --name add_preset_views`
# 3. Migration SQL generated in packages/database/migrations/
# 4. CI runs `pnpm db:migrate deploy` in preview deployments
# 5. Production migration is manual via GitHub Actions workflow
#     (NOT automatic on deploy — prevents accidental schema changes)

# Key rules:
# - NEVER use `prisma db push` in production
# - ALWAYS create a migration file
# - Backwards-compatible changes only (add columns as nullable, then populate)
# - Breaking changes require a versioned API change first
```

### 6.3 Query Optimization

```typescript
// Indexed queries for high-traffic endpoints

// Preset listing with filters
const presets = await prisma.preset.findMany({
  where: {
    status: 'PUBLISHED',
    deletedAt: null,
    // Filter junction tables via nested relations
    models: modelId ? { some: { modelId } } : undefined,
    tasks: taskId ? { some: { taskId } } : undefined,
  },
  orderBy: sort === 'downloads'
    ? { downloadCount: 'desc' }
    : sort === 'rating'
    ? { averageRating: 'desc' }
    : { publishedAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
  // Select only needed fields
  select: {
    id: true, name: true, slug: true, tagline: true,
    version: true, downloadCount: true, averageRating: true,
    isFeatured: true, publishedAt: true,
    author: { select: { username: true, avatarUrl: true } },
    models: { select: { model: { select: { slug: true, name: true } } } },
    tasks: { select: { task: { select: { slug: true, name: true } } } },
    designLanguages: { select: { designLanguage: { select: { slug: true, name: true } } } },
  },
});

// N+1 prevention: always use `include` or `select` explicitly
// Never rely on lazy loading in API routes
```

---

## 7. Authentication & Authorization

### 7.1 NextAuth Configuration

```typescript
// src/lib/auth/config.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Discord from 'next-auth/providers/discord';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@agentmd/database';
import { compare } from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
    Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
    Discord({ clientId: process.env.DISCORD_ID!, clientSecret: process.env.DISCORD_SECRET! }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.displayName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
});
```

### 7.2 Middleware

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

// Role-based route protection
const protectedRoutes = [
  { pattern: /^\/profile/, roles: ['USER', 'MAINTAINER', 'MODERATOR', 'ADMIN'] },
  { pattern: /^\/dashboard/, roles: ['MAINTAINER', 'MODERATOR', 'ADMIN'] },
  { pattern: /^\/admin/, roles: ['MODERATOR', 'ADMIN'] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Check protected routes
  for (const route of protectedRoutes) {
    if (route.pattern.test(pathname)) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/sign-in', req.url));
      }
      if (!route.roles.includes(session.user.role as any)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
```

### 7.3 Authorization Helper

```typescript
// src/lib/auth/authorize.ts
import { auth } from './config';

export type Role = 'USER' | 'MAINTAINER' | 'MODERATOR' | 'ADMIN';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
  return session;
}

export async function requireOwner(resourceOwnerId: string) {
  const session = await requireAuth();
  if (session.user.id !== resourceOwnerId && session.user.role !== 'ADMIN') {
    throw new ApiError(403, 'FORBIDDEN', 'Not the resource owner');
  }
  return session;
}
```

---

## 8. Caching Architecture

### 8.1 Multi-Layer Cache

```
┌───────────────────────────────────────────────────────────────────┐
│                         Browser Cache                              │
│  • Static assets: 1 year (hash-based filenames)                   │
│  • API responses: no-cache (freshness matters)                     │
│  • SWR for preset list: stale-while-revalidate = 60s               │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Cloudflare CDN Cache                          │
│  • Public pages (HTML): 5 minutes                                  │
│  • Preset list API: 30 seconds                                     │
│  • Taxonomy data: 1 hour                                           │
│  • Preset ZIPs: 1 hour (popular), 0 (long-tail)                    │
│  • Static assets: 1 year                                           │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Vercel ISR Cache                              │
│  • Homepage: revalidate = 3600                                     │
│  • Preset detail: revalidate = 60                                  │
│  • Preset list pages: revalidate = 300                             │
│  • Taxonomy pages: revalidate = 3600                               │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Redis Cache (Upstash)                         │
│  • Hot preset data: TTL = 300s                                     │
│  • Taxonomy tree: TTL = 3600s                                      │
│  • User session: JWT (no server-side session needed)               │
│  • Rate limit counters: sliding window                             │
│  • Download URLs: TTL = 3600s (signed R2 URLs)                     │
└───────────────────────────────────────────────────────────────────┘
```

### 8.2 Cache Invalidation Strategy

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache-aside pattern
export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  return data;
}

// Tag-based invalidation
const CACHE_TAGS = {
  preset: (id: string) => `preset:${id}`,
  presetList: (filters: string) => `presets:list:${filters}`,
  taxonomy: 'taxonomy',
  user: (id: string) => `user:${id}`,
  collection: (id: string) => `collection:${id}`,
};

export async function invalidateTags(...tags: string[]) {
  if (tags.length > 0) {
    await redis.del(...tags);
  }
  // Also revalidate ISR paths
  // This is done via Vercel's revalidate API or on-demand ISR
}

// Usage after preset update:
await invalidateTags(
  CACHE_TAGS.preset(presetId),
  CACHE_TAGS.presetList(`model:${modelId}`),
);
```

### 8.3 React Query Configuration

```typescript
// src/lib/api/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,    // Presets change infrequently
    },
  },
});

// Custom hooks with optimistic updates
export function useSavePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presetId: string) => api.presets.save(presetId),
    onMutate: async (presetId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['savedPresets'] });
      // Snapshot previous value
      const previous = queryClient.getQueryData(['savedPresets']);
      // Optimistically update
      queryClient.setQueryData(['savedPresets'], (old: any) => [...old, presetId]);
      return { previous };
    },
    onError: (err, presetId, context) => {
      // Rollback on error
      queryClient.setQueryData(['savedPresets'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPresets'] });
    },
  });
}
```

---

## 9. File Storage & Downloads

### 9.1 Upload Architecture

Preset creation involves uploading markdown files. The upload flow is distinct from the download flow and has its own architectural concerns.

**Upload Flow:**
```
User uploads files
  │
  ▼
Client-side: Drag-and-drop UI (preset-form.tsx)
  ├── Individual file drops (.md, .mdx, .txt, .json)
  ├── ZIP upload (extracted client-side for preview)
  └── Inline markdown editor
  │
  ▼
Client-side validation (before server upload):
  ├── File type check (.md only)
  ├── File size check (<10MB per file)
  └── File count check (<500 files)
  │
  ▼
Multipart upload to API route: POST /api/upload
  ├── Files streamed directly to R2 temp bucket (agentmd-temp/)
  ├── TTL on temp objects: 24 hours (auto-cleanup via cron)
  └── Returns signed URLs for each file
  │
  ▼
Server-side validation (background job):
  ├── Markdown parsing & linting
  ├── Link validity check
  ├── Malware scan (file content)
  └── Plagiarism check (against existing presets)
  │
  ▼
On preset publish:
  ├── Files moved from temp to permanent storage in DB (preset_files table)
  ├── Temp files cleaned up
  └── ZIP generation job enqueued
```

**Upload API route:**
```typescript
// src/app/api/upload/route.ts
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { requireAuth } from '@/lib/auth/authorize';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const uploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1).max(500),
});

export async function POST(req: Request) {
  const session = await requireAuth();
  await rateLimit(`upload:${session.user.id}`, { limit: 50, window: 3600 });

  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  // Validate each file
  for (const file of files) {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.mdx')) {
      return NextResponse.json({ error: `Invalid file type: ${file.name}` }, { status: 422 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 422 });
    }
  }

  // Stream to R2 temp bucket
  const uploads = await Promise.all(
    files.map(async (file) => {
      const key = `temp/${session.user.id}/${crypto.randomUUID()}-${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      await s3.send(new PutObjectCommand({
        Bucket: 'agentmd-temp',
        Key: key,
        Body: buffer,
        ContentType: file.type || 'text/markdown',
      }));

      return { fileName: file.name, key, size: file.size };
    })
  );

  return NextResponse.json({ success: true, data: { uploads } });
}
```

**Chunked upload (future):** For very large ZIPs (>10MB), the client splits the file into 5MB chunks, uploads them concurrently, and the server reassembles them. This prevents serverless function timeout limits (Vercel Hobby: 10s, Pro: 60s).

---

### 9.2 Object Storage Strategy

### 9.1 Object Storage Strategy

```
Cloudflare R2 Buckets:
├── agentmd-presets/       # Preset ZIP archives
│   ├── deepseek-saas-apple-v1.0.0.zip
│   ├── claude-landing-material-v2.1.0.zip
│   └── ...
├── agentmd-avatars/       # User profile avatars
│   ├── user-abc123.jpg
│   └── ...
├── agentmd-og-images/     # Open Graph preview images
│   ├── preset-deepseek-saas-apple.png
│   └── ...
└── agentmd-temp/          # Temporary uploads (TTL: 24h)
    └── upload-xyz/...
```

**Why R2 over S3:** Zero egress fees. When users download preset ZIPs, we're not paying per-GB transfer costs. This is critical for a content registry where downloads are the primary action.

### 9.2 ZIP Generation Service

```typescript
// services/zip-generator/src/index.ts
import { Worker, Job } from 'bullmq';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import archiver from 'archiver';
import { prisma } from '@agentmd/database';
import { Readable } from 'stream';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

interface ZipJobData {
  presetId: string;
  version: string;
}

const zipWorker = new Worker<ZipJobData>(
  'zip-generation',
  async (job: Job<ZipJobData>) => {
    const { presetId, version } = job.data;

    // 1. Fetch preset data
    const preset = await prisma.preset.findUnique({
      where: { id: presetId },
      include: {
        files: { orderBy: { sortOrder: 'asc' } },
        models: { include: { model: true } },
      },
    });

    if (!preset) throw new Error(`Preset ${presetId} not found`);

    // 2. Generate ZIP in memory stream
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));

    // Add main model file
    const modelSlug = preset.models[0]?.model.slug.toUpperCase() || 'DEFAULT';
    archive.append(Buffer.from(preset.files[0]?.content || ''), {
      name: `${modelSlug}.md`,
    });

    // Add docs directory
    const docsFiles = preset.files.filter((f) => f.filePath.startsWith('docs/'));
    for (const file of docsFiles) {
      archive.append(Buffer.from(file.content), { name: file.filePath });
    }

    // Add README + CHANGELOG
    archive.append(Buffer.from(`# ${preset.name}\n\n${preset.description}`), {
      name: 'README.md',
    });

    await archive.finalize();
    const zipBuffer = Buffer.concat(chunks);

    // 3. Upload to R2
    const key = `presets/${preset.slug}-v${version}.zip`;
    await new Upload({
      client: r2,
      params: {
        Bucket: 'agentmd-presets',
        Key: key,
        Body: zipBuffer,
        ContentType: 'application/zip',
        Metadata: {
          'preset-id': presetId,
          version: version,
        },
      },
    }).done();

    // 4. Update preset version with checksum
    const crypto = await import('crypto');
    const checksum = crypto.createHash('sha256').update(zipBuffer).digest('hex');

    await prisma.presetVersion.update({
      where: { presetId_version: { presetId, version } },
      data: { checksum },
    });

    return { key, checksum, size: zipBuffer.length };
  },
  {
    connection: { url: process.env.REDIS_URL! },
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  }
);
```

### 9.3 Signed Download URLs

```typescript
// src/lib/storage/signed-url.ts
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'agentmd-presets',
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"`,
  });

  // URL expires in 1 hour
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}
```

---

## 10. Search Architecture

### 10.1 PostgreSQL Full-Text Search (MVP)

PostgreSQL full-text search (GIN indexes on tsvector) handles the first 50,000 presets. At this scale, query times stay under 50ms for typical searches.

```sql
-- Migration: add search vector to presets
ALTER TABLE presets ADD COLUMN search_vector tsvector;

-- Create trigger to auto-update search vector
CREATE OR REPLACE FUNCTION update_preset_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preset_search_vector
  BEFORE INSERT OR UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_preset_search_vector();

-- GIN index for fast search
CREATE INDEX idx_presets_search ON presets USING GIN(search_vector);
```

### 10.2 Elasticsearch Migration Path (Post-MVP)

When PostgreSQL FTS hits performance limits (>50K presets or query latency >100ms), migrate to a dedicated Elasticsearch cluster. The migration follows a dual-write + backfill strategy to avoid downtime.

**Migration Phases:**

**Phase 1 — Dual Write (zero downtime):**
```
App writes to PostgreSQL AND Elasticsearch simultaneously
  └── Reads continue from PostgreSQL (no behavior change)
  └── Migration script does initial backfill of all existing presets
```

**Phase 2 — Dual Read (validation):**
```
App reads from Elasticsearch for search queries
  └── Compare Elasticsearch vs PostgreSQL results in background
  └── Log discrepancies for investigation
  └── Fall back to PostgreSQL if Elasticsearch returns errors
```

**Phase 3 — Cutover:**
```
Elasticsearch becomes the primary search backend
  └── PostgreSQL FTS index remains for fallback (1 week)
  └── After 1 week, drop PostgreSQL index
```

**Sync mechanism:**
```typescript
// Background job: sync preset to Elasticsearch
async function syncPresetToES(presetId: string) {
  const preset = await prisma.preset.findUnique({
    where: { id: presetId },
    include: { models: true, tasks: true, files: { take: 1 } },
  });
  
  await esClient.index({
    index: 'presets',
    id: preset.id,
    body: {
      name: preset.name,
      tagline: preset.tagline,
      description: preset.description,
      models: preset.models.map(m => m.modelId),
      tasks: preset.tasks.map(t => t.taskId),
      content: preset.files[0]?.content,
      downloadCount: preset.downloadCount,
      averageRating: preset.averageRating,
      publishedAt: preset.publishedAt,
    },
  });
}

// Triggered via Prisma middleware or queue:
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (params.model === 'Preset' && ['create', 'update'].includes(params.action)) {
    await queues.elasticsearch.add('sync', { presetId: result.id });
  }
  return result;
});
```

**Rollback plan:** If Elasticsearch has issues, swap back to PostgreSQL by changing an environment variable `SEARCH_BACKEND=elasticsearch|postgresql` at the application level. No data loss — PostgreSQL remains the source of truth throughout.

---

### 10.3 Search Service

```typescript
// src/lib/services/search.ts
import { prisma } from '@agentmd/database';
import { Prisma } from '@prisma/client';

interface SearchOptions {
  query: string;
  models?: string[];
  tasks?: string[];
  categories?: string[];
  designLanguages?: string[];
  frameworks?: string[];
  sort?: 'relevance' | 'downloads' | 'rating' | 'newest';
  cursor?: string;
  limit?: number;
}

export async function searchPresets(options: SearchOptions) {
  const { query, models, tasks, categories, sort = 'relevance', limit = 20 } = options;

  const where: Prisma.PresetWhereInput = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  // Full-text search
  if (query) {
    where.searchVector = {
      search: query,
      config: 'english',
    };
  }

  // Faceted filters
  if (models?.length) {
    where.models = { some: { model: { slug: { in: models } } } };
  }
  if (tasks?.length) {
    where.tasks = { some: { task: { slug: { in: tasks } } } };
  }
  if (categories?.length) {
    where.categories = { some: { category: { slug: { in: categories } } } };
  }
  if (designLanguages?.length) {
    where.designLanguages = { some: { designLanguage: { slug: { in: designLanguages } } } };
  }

  // Sort
  const orderBy: Prisma.PresetOrderByWithRelationInput[] = [];
  switch (sort) {
    case 'downloads': orderBy.push({ downloadCount: 'desc' }); break;
    case 'rating': orderBy.push({ averageRating: 'desc' }); break;
    case 'newest': orderBy.push({ publishedAt: 'desc' }); break;
    case 'relevance':
    default:
      if (query) {
        // PostgreSQL ts_rank for relevance sorting
        orderBy.push({ searchVector: { sort: 'desc', query } } as any);
      } else {
        orderBy.push({ downloadCount: 'desc' });
      }
  }

  const presets = await prisma.preset.findMany({
    where,
    orderBy,
    take: limit,
    // ... select fields
  });

  // Also return facet counts for filter sidebar
  const [modelCounts, taskCounts] = await Promise.all([
    prisma.presetModel.groupBy({
      by: ['modelId'],
      where: { preset: where },
      _count: true,
    }),
    prisma.presetTask.groupBy({
      by: ['taskId'],
      where: { preset: where },
      _count: true,
    }),
  ]);

  return {
    presets,
    facets: {
      models: modelCounts,
      tasks: taskCounts,
    },
  };
}
```

---

## 11. Background Jobs & Queues

### 11.1 Queue Architecture

```
BullMQ Queues (Redis-backed)
├── zip-generation
│   ├── Concurrency: 5
│   ├── Retry: 3 (exponential backoff)
│   ├── TTR: 5 minutes
│   └── Dead-letter: zip-generation-dlq (retries exhausted)
│
├── github-scan
│   ├── Concurrency: 10
│   ├── Retry: 2
│   ├── TTR: 30 seconds
│   └── Dead-letter: github-scan-dlq
│
├── email-delivery
│   ├── Concurrency: 20
│   ├── Retry: 5
│   ├── TTR: 10 seconds
│   └── Dead-letter: email-dlq
│
├── analytics-aggregation
│   ├── Concurrency: 1 (singleton)
│   ├── Repeat: every hour
│   ├── TTR: 5 minutes
│   └── Dead-letter: analytics-dlq
│
├── notification-dispatch
│   ├── Concurrency: 10
│   ├── Retry: 3
│   ├── TTR: 10 seconds
│   └── Dead-letter: notifications-dlq
│
└── elasticsearch-sync           (Phase 2+)
    ├── Concurrency: 5
    ├── Retry: 3
    └── Dead-letter: es-sync-dlq
```

**Dead-letter queues (DLQ):** Every queue has a corresponding DLQ. When a job exhausts all retry attempts, it moves to the DLQ instead of being discarded. A monitoring alert fires when the DLQ depth exceeds a threshold (e.g., 10 jobs). Operators inspect and replay DLQ jobs after fixing the underlying issue.

### 11.2 Job Producer

```typescript
// src/lib/queue.ts
import { Queue } from 'bullmq';

const connection = { url: process.env.REDIS_URL! };

export const queues = {
  zipGeneration: new Queue('zip-generation', { 
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 3600 * 24 * 7 },
      removeOnFail: { age: 3600 * 24 * 30 }, // Keep failed jobs for 30 days for debugging
    },
  }),
  githubScan: new Queue('github-scan', { connection }),
  emailDelivery: new Queue('email-delivery', { connection }),
  analytics: new Queue('analytics-aggregation', { connection }),
  notifications: new Queue('notification-dispatch', { connection }),
  elasticsearch: new Queue('elasticsearch-sync', { connection }),
};

// Usage after preset version bump:
await queues.zipGeneration.add(
  `zip:${presetId}:${version}`,
  { presetId, version },
);
```

### 11.3 Worker with Error Reporting

Every worker catches errors and reports them to Sentry. Failed jobs are logged with context for debugging.

```typescript
// services/zip-generator/src/index.ts
import { Worker, Job } from 'bullmq';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

const zipWorker = new Worker<ZipJobData>(
  'zip-generation',
  async (job: Job<ZipJobData>) => {
    try {
      // ... ZIP generation logic ...
    } catch (error) {
      Sentry.captureException(error, {
        tags: { queue: 'zip-generation', jobId: job.id },
        extra: { presetId: job.data.presetId, attempt: job.attemptsMade },
      });
      throw error; // BullMQ handles retry + DLQ
    }
  },
  {
    connection: { url: process.env.REDIS_URL! },
    concurrency: 5,
  }
);

// Log worker events for monitoring
zipWorker.on('failed', (job, error) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'ZIP generation failed',
    queue: 'zip-generation',
    jobId: job?.id,
    presetId: job?.data.presetId,
    attempts: job?.attemptsMade,
    error: error.message,
  }));
});

zipWorker.on('completed', (job) => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'ZIP generation completed',
    queue: 'zip-generation',
    jobId: job.id,
    presetId: job.data.presetId,
    duration: Date.now() - job.timestamp,
  }));
});
```

---

## 12. Rate Limiting

### 12.1 Rate Limiter Implementation

```typescript
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different endpoints
export const rateLimiters = {
  // Search: 30 requests per minute per IP
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'ratelimit:search',
  }),

  // Download (anonymous): 5 per day per IP
  // Uses FIXED window (not sliding) to match "per day" semantics.
  // Sliding window would allow 5 downloads at 11:59 PM and 5 more at 12:01 AM
  // — effectively 10 in 2 minutes, which defeats the purpose.
  downloadAnon: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '86400 s'),
    prefix: 'ratelimit:download:anon',
  }),

  // Download (authenticated): 20 per minute per user
  downloadAuth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    prefix: 'ratelimit:download:auth',
  }),

  // Auth (login): 5 per 15 minutes per email/IP
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '900 s'),
    prefix: 'ratelimit:login',
  }),

  // API (key-based): 100 per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:api',
  }),

  // Admin actions: 60 per minute
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    prefix: 'ratelimit:admin',
  }),
};

// Usage:
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<void> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    throw new ApiError(429, 'RATE_LIMITED', `Rate limit exceeded. Resets at ${new Date(reset).toISOString()}`);
  }
}
```

---

## 12.5 WebSocket / Real-Time Strategy

**ARCHITECTURAL CONSTRAINT:** Vercel serverless functions do not support persistent WebSocket connections. This affects real-time notification delivery (Phase 2+).

**Strategy: Polling with graceful upgrade path**

```
Phase 1-2: Polling (default)
  ├── Client polls GET /api/notifications/unread every 60 seconds
  ├── Server returns { count, notifications[] }
  ├── Cache: unread count cached in Redis (30s TTL) to reduce DB load
  └── No persistent connection overhead

Phase 3+: WebSocket Server (separate deployment)
  ├── Deploy a standalone WebSocket server on Railway/Fly.io
  ├── Socket.io for automatic fallback (WebSocket → polling)
  ├── Only handles real-time events — not API requests
  ├── Scaled independently from the main app
  └── Architecture:
      ┌──────────────┐     HTTP API      ┌──────────────────┐
      │  Vercel App  │ ◄──────────────► │  PostgreSQL +     │
      │ (Next.js)    │                   │  Redis            │
      └──────┬───────┘                   └────────┬─────────┘
             │ WebSocket (wss://)                  │
             ▼                                     │
      ┌──────────────┐                             │
      │ Socket.io    │ ◄──── Redis Pub/Sub ────────┘
      │ Server       │     (notification events)
      └──────────────┘
```

**Why not build WebSocket from day one:** The polling approach handles up to 10K concurrent users with sub-minute latency. Building and operating a WebSocket server adds significant complexity (connection management, reconnection, scaling). Only invest in WebSocket when polling latency becomes a user-experience problem.

---

## 13. Error Handling

### 13.1 Error Hierarchy

```typescript
// AgentError: Base application error
//  ├── ApiError: HTTP API errors (used in route handlers)
//  │    ├── 401 UnauthorizedError
//  │    ├── 403 ForbiddenError
//  │    ├── 404 NotFoundError
//  │    ├── 409 ConflictError
//  │    ├── 422 ValidationError
//  │    └── 429 RateLimitError
//  │
//  ├── ServiceError: Business logic errors
//  │    ├── PresetNotFoundError
//  │    ├── PresetSlugTakenError
//  │    ├── UploadTooLargeError
//  │    └── InvalidFileTypeError
//  │
//  ├── StorageError: External storage errors
//  │    ├── UploadFailedError
//  │    └── DownloadFailedError
//  │
//  └── IntegrationError: Third-party API errors
//       ├── GitHubApiError
//       └── EmailDeliveryError
```

### 13.2 Global Error Boundary

```typescript
// src/app/(browse)/error.tsx
'use client';

export default function BrowseErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        We encountered an error while loading this page.
        Our team has been notified.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh page
        </Button>
        <Button onClick={reset}>
          Try again
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-muted-foreground mt-4 p-4 bg-muted rounded-lg max-w-xl overflow-auto">
          {error.message}
          {error.stack}
        </pre>
      )}
    </div>
  );
}
```

---

## 14. Logging & Monitoring

### 14.1 Logging Architecture

```
Application Logs (stdout)
    │
    ▼
Vercel Logs (built-in)    ────›     Sentry
  • API route logs                   • Error tracking
  • Edge function logs               • Performance monitoring
  • ISR cache events                 • Replay (user sessions)
    │
    ▼
Axiom / Logtail                     DataDog / Grafana
  • Structured JSON logs             • Infrastructure metrics
  • Audit trail                      • Database performance
  • Download events                  • Redis monitoring
```

### 14.2 Structured Logging

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export function logger(entry: Omit<LogEntry, 'timestamp'>) {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    // Pretty-print in development
    const prefix = `[${logEntry.level.toUpperCase()}]`;
    console.log(prefix, logEntry.message, logEntry.metadata || '');
  } else {
    // Structured JSON in production
    console.log(JSON.stringify(logEntry));
  }

  // Send errors to Sentry
  if (entry.level === 'error') {
    Sentry.captureException(entry.metadata?.error, {
      tags: { action: entry.action },
      user: entry.userId ? { id: entry.userId } : undefined,
    });
  }
}

// Usage in API routes:
logger({
  level: 'info',
  message: 'Preset downloaded',
  action: 'preset.download',
  userId: session?.user.id,
  duration: Date.now() - start,
  metadata: { presetId, fileSize: 1024 },
});
```

---

## 15. SEO Architecture

### 15.1 Metadata Generation

```typescript
// src/lib/seo.ts
import { Metadata } from 'next';

export function generatePresetMetadata(preset: {
  name: string;
  tagline: string;
  description: string;
  slug: string;
  author: { username: string };
  averageRating: number;
  downloadCount: number;
}): Metadata {
  const title = `${preset.name} — Agent.md`;
  const description = preset.tagline;
  const imageUrl = `${process.env.NEXT_PUBLIC_URL}/og/presets/${preset.slug}.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/presets/${preset.slug}`,
    },
  };
}
```

### 15.2 Sitemap Generation

```typescript
// src/app/sitemap.ts
import { prisma } from '@agentmd/database';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  // Static pages
  const staticPages = [
    '', '/about', '/roadmap', '/contributing', '/license',
    '/presets', '/categories', '/models', '/tasks',
    '/design-languages', '/wizard',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Dynamic preset pages (top 1000 by downloads)
  const presets = await prisma.preset.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: { downloadCount: 'desc' },
    take: 1000,
    select: { slug: true, updatedAt: true },
  });

  const presetPages = presets.map((preset) => ({
    url: `${baseUrl}/presets/${preset.slug}`,
    lastModified: preset.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...presetPages];
}
```

---

## 16. Testing Strategy

### 16.1 Test Pyramid

```
         ╱─────╲
        ╱  E2E  ╲           Few: Critical user journeys
       ╱─────────╲          Playwright (5-10 tests)
      ╱───────────╲
     ╱ Integration  ╲       Some: API routes, database, auth
    ╱────────────────╲      Vitest + Supertest (50-100 tests)
   ╱──────────────────╲
  ╱    Unit Tests       ╲    Many: Services, validators, utils, hooks
 ╱────────────────────────╲  Vitest + Testing Library (200+ tests)
╱──────────────────────────╲
```

### 16.2 Test File Co-location

```
src/
├── lib/
│   ├── services/
│   │   ├── preset.service.ts
│   │   ├── preset.service.test.ts   ← Co-located unit test
│   │   └── __mocks__/
│   │       └── prisma.ts            ← Mock database
│   └── validators/
│       ├── preset.validator.ts
│       └── preset.validator.test.ts ← Co-located validator test
│
└── app/
    └── api/
        └── presets/
            ├── route.ts
            └── route.test.ts        ← Co-located integration test
```

### 16.3 Testing Infrastructure

```typescript
// packages/database/src/test-utils.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Test database — created fresh per test suite
const testDbUrl = process.env.TEST_DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });

export async function setupTestDatabase() {
  execSync('pnpm db:push --force-reset', {
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
}

// Factory functions for test data
export function createTestPreset(overrides = {}) {
  return prisma.preset.create({
    data: {
      name: 'Test Preset',
      slug: 'test-preset',
      tagline: 'A test preset for testing',
      status: 'PUBLISHED',
      authorId: testUser.id,
      ...overrides,
    },
  });
}
```

### 16.4 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 17. CI/CD Pipeline

### 17.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: agentmd
          POSTGRES_PASSWORD: agentmd
          POSTGRES_DB: agentmd_test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm db:push
        env:
          DATABASE_URL: postgresql://agentmd:agentmd@localhost:5432/agentmd_test

      - run: pnpm test -- --coverage
        env:
          DATABASE_URL: postgresql://agentmd:agentmd@localhost:5432/agentmd_test
          REDIS_URL: redis://localhost:6379

      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
```

### 17.2 Deployment Pipeline

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build --filter=web
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-services:
    runs-on: ubuntu-latest
    needs: migrate
    strategy:
      matrix:
        service: [zip-generator, github-scanner, notification-sender, analytics-aggregator]

    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -f docker/Dockerfile.service \
            --build-arg SERVICE=${{ matrix.service }} \
            -t ghcr.io/agentmd/${{ matrix.service }}:${{ github.sha }} .
      - name: Push to registry
        run: |
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/agentmd/${{ matrix.service }}:${{ github.sha }}
      - name: Deploy to Railway/Fly.io
        run: |
          # Deploy command for your container platform
          flyctl deploy --image ghcr.io/agentmd/${{ matrix.service }}:${{ github.sha }}

  migrate:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm db:migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  notify:
    needs: [deploy-web, deploy-services]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "Agent.md production deployment complete 🚀"}'
```

---

## 18. Feature Flags

Feature flags control which product features are visible to which users. Essential for a multi-phase rollout (Phases 1–5) where code for future features is deployed alongside current features but remains hidden.

**Strategy: Vercel Feature Flags (Edge Config) + Environment Variables**

```
Flag Store (Vercel Edge Config / Upstash Redis)
  │
  ├── Global flags (applies to all users)
  │   ├── marketplace_enabled: false          (Phase 5)
  │   ├── github_scanner_enabled: false       (Phase 4)
  │   ├── api_keys_enabled: false             (Phase 3)
  │   └── comparison_enabled: true            (Phase 2)
  │
  ├── Role-based flags (applies to user roles)
  │   ├── analytics_dashboard: [MAINTAINER, MODERATOR, ADMIN]
  │   └── community_submissions: [REGISTERED, MAINTAINER]
  │
  └── User-specific flags (applies to specific users)
      └── beta_access: [user-id-1, user-id-2]  (for testing)
```

**Implementation:**

```typescript
// src/lib/feature-flags.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.FLAGS_REDIS_URL!,
  token: process.env.FLAGS_REDIS_TOKEN!,
});

type FeatureFlag =
  | 'marketplace_enabled'
  | 'github_scanner_enabled'
  | 'api_keys_enabled'
  | 'comparison_enabled'
  | 'analytics_dashboard'
  | 'community_submissions'
  | 'beta_access';

interface UserContext {
  id: string;
  role: 'USER' | 'MAINTAINER' | 'MODERATOR' | 'ADMIN';
}

export async function isFeatureEnabled(
  flag: FeatureFlag,
  user?: UserContext
): Promise<boolean> {
  // Admin always sees everything
  if (user?.role === 'ADMIN') return true;

  // Check global flag first
  const globalValue = await redis.get<boolean | string[]>(`flag:${flag}`);

  if (typeof globalValue === 'boolean') {
    return globalValue;
  }

  // Role-based flag (value is an array of allowed roles)
  if (Array.isArray(globalValue)) {
    return user ? globalValue.includes(user.role) : false;
  }

  // Default: disabled
  return false;
}

// Admin panel to toggle flags (admin-only UI at /admin/features)
export async function setFeatureFlag(
  flag: FeatureFlag,
  value: boolean | string[]
): Promise<void> {
  await redis.set(`flag:${flag}`, value);
}
```

**Usage in components:**

```tsx
// Server-side check (for redirects or conditionally rendering sections)
const marketplaceEnabled = await isFeatureEnabled('marketplace_enabled', session?.user);

// Client-side check (for hiding/showing UI elements)
'use client';
function useFeatureFlag(flag: FeatureFlag) {
  return useQuery({
    queryKey: ['feature-flag', flag],
    queryFn: () => fetch(`/api/feature-flags?flag=${flag}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Lifecycle of a feature flag:**

```
1. Developer adds flag: false in Edge Config ─── Feature hidden
2. QA/testing: flag set to true for specific users ─── Beta testers can see it
3. Rollout Phase 1: flag set to true globally ─── Feature live for everyone
4. Stabilization period (2 weeks) ─── Monitor for issues
5. Remove flag: delete from code + Edge Config ─── Feature becomes permanent
```

---

## 19. Deployment Architecture

### 18.1 Vercel Configuration

```typescript
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "hkg1", "lhr1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 512,
      "maxDuration": 30
    },
    "src/app/api/presets/**/download/route.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/crons/cleanup-temp",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/crons/anonymize-downloads",
      "schedule": "0 3 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/presets/(.*)\\.zip",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ],
  "redirects": [
    { "source": "/packs/(.*)", "destination": "/presets/$1", "permanent": true }
  ]
}
```

### 18.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: agentmd
      POSTGRES_PASSWORD: agentmd
      POSTGRES_DB: agentmd_dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data

  minio:
    image: minio/minio
    command: server /data --console-address ':9001'
    environment:
      MINIO_ROOT_USER: agentmd
      MINIO_ROOT_PASSWORD: agentmd123
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - miniodata:/data

  mailpit:
    image: axllent/mailpit
    ports:
      - '1025:1025'   # SMTP
      - '8025:8025'   # Web UI

volumes:
  pgdata:
  redisdata:
  miniodata:
```

### 18.3 Environment Variables

```bash
# .env.local.example

# Database
DATABASE_URL="postgresql://agentmd:agentmd@localhost:5432/agentmd_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Object Storage (R2/MinIO)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="agentmd"
STORAGE_SECRET_KEY="agentmd123"
STORAGE_BUCKET="agentmd-dev"

# Auth
AUTH_SECRET="generate-a-random-secret-with-openssl-rand-64"
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
DISCORD_ID=""
DISCORD_SECRET=""

# Email
RESEND_API_KEY=""

# Monitoring
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# Analytics
POSTHOG_KEY=""
POSTHOG_HOST=""

# Next.js
NEXT_PUBLIC_URL="http://localhost:3000"
```

---

## 20. Security Architecture

### 19.1 Security Measures by Layer

| Layer | Measure |
|---|---|
| **Network** | Cloudflare WAF, DDoS protection, TLS 1.3 |
| **CDN** | Web application firewall (WAF) rules for SQLi/XSS |
| **Application** | CSP headers, input validation (Zod), rate limiting |
| **Auth** | JWT with short expiry (24h), httpOnly cookies, CSRF tokens via NextAuth |
| **API** | Rate limiting per endpoint, request size limits (1MB body) |
| **Database** | Parameterized queries (Prisma), connection pooling, encrypted at rest |
| **Storage** | Signed URLs with 1hr expiry, no public bucket access |
| **File Upload** | Malware scanning, mime type validation, size limits (50MB) |
| **CI/CD** | No secrets in code, Dependabot alerts, branch protection |

### 19.2 CSP Configuration

```typescript
// next.config.js
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.upstash.io https://*.sentry.io https://*.posthog.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s+/g, ' ').trim();

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};
```

---

## 21. Performance Budgets

### 20.1 Budget Targets

| Metric | Target | Failure Threshold |
|---|---|---|
| **Lighthouse Performance** | ≥ 90 | < 80 |
| **Lighthouse Accessibility** | ≥ 95 | < 90 |
| **Lighthouse Best Practices** | ≥ 95 | < 90 |
| **Lighthouse SEO** | ≥ 95 | < 90 |
| **First Contentful Paint (FCP)** | < 1.5s | > 2.5s |
| **Largest Contentful Paint (LCP)** | < 2.0s | > 3.5s |
| **First Input Delay (FID)** | < 100ms | > 300ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | > 0.25 |
| **Time to Interactive (TTI)** | < 3.0s | > 5.0s |
| **Total Bundle Size (JS)** | < 200KB | > 400KB |
| **Total Bundle Size (CSS)** | < 50KB | > 100KB |
| **API Response Time (p95)** | < 200ms | > 500ms |
| **API Error Rate** | < 0.1% | > 1% |
| **Database Query Time (p95)** | < 50ms | > 200ms |
| **Cache Hit Ratio** | > 80% | < 60% |

### 20.2 Bundle Analysis

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ...
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
});
```

### 20.3 Monitoring Dashboard

```
Grafana Dashboard: Agent.md Production
├── Overview
│   ├── Requests per second (by route)
│   ├── p50/p95/p99 response times
│   ├── Error rate (by status code)
│   └── Active users (concurrent sessions)
│
├── Database
│   ├── Connection pool utilization
│   ├── Query execution time (p95)
│   ├── Cache hit ratio
│   └── Slow query log
│
├── Redis
│   ├── Memory usage
│   ├── Hit rate (per key prefix)
│   ├── Queue depth (BullMQ)
│   └── Eviction rate
│
├── Storage (R2)
│   ├── Total stored objects
│   ├── Download throughput (MB/s)
│   ├── Egress bandwidth
│   └── Popular preset downloads
│
└── Business
    ├── Total presets (published vs draft)
    ├── Total users
    ├── Downloads (today, this week, this month)
    ├── Preset creation rate
    └── Search query volume
```

---

## Appendix A: Key Architectural Decisions

| Decision | Chosen Approach | Rejected Alternatives | Rationale |
|---|---|---|---|
| **API Layer** | Next.js API routes | Express server, tRPC, GraphQL | Single deployment target (Vercel). No separate server to maintain. Route co-location with pages. |
| **Database ORM** | Prisma | Drizzle, TypeORM, Kysely | Schema-first approach. Auto-generated types. Mature migration system. Best docs. |
| **State Management** | React Query + Zustand | Redux, Jotai, Valtio | RQ handles server state (caching, refetching, optimistic updates). Zustand handles minimal client state. No boilerplate. |
| **Background Jobs** | BullMQ + Redis | Inngest, Trigger.dev, PostgreSQL queue | Full control over queue management. Redis already in stack. Complex job chains (retries, delays, concurrency). |
| **Object Storage** | Cloudflare R2 | AWS S3, GCS, Supabase Storage | Zero egress fees critical for download-heavy app. Global CDN. Cheap. |
| **Auth** | NextAuth.js | Clerk, Supabase Auth, Lucia | Open source. Self-hosted. Full control over auth flow. Broad OAuth provider support. |
| **Email** | Resend | SendGrid, Postmark, SES | Best developer experience. React Email integration. Generous free tier. |
| **Search (MVP)** | PostgreSQL FTS | Elasticsearch, Meilisearch, Typesense | Zero additional infrastructure. Good enough for <50K presets. Can migrate when needed. |
| **Testing** | Vitest + Playwright | Jest, Cypress, MSW | Fast (Vitest is 10x faster than Jest). Same config as Vite. Playwright for cross-browser E2E. |
| **CSS Framework** | Tailwind CSS | Vanilla CSS, CSS Modules, Stitches | Utility-first. Zero runtime. Best DX with shadcn/ui. |

---

*This architecture document is a living specification intended to guide implementation decisions. Every trade-off is documented with its rationale so future developers understand why decisions were made.*
