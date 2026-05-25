# weissesneaker.de Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete affiliate sneaker website (Next.js 14 + Supabase) with three public pages, a Supabase-backed sneaker database, and a protected admin panel for CRUD management.

**Architecture:** Next.js 14 App Router — Server Components fetch Supabase directly, no API layer. Public `/sneaker` filtering via URL parameters (server-side Supabase query). Admin panel protected by Supabase Auth session check in `layout.tsx`. After admin mutations `revalidatePath()` immediately refreshes public pages.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `@supabase/ssr`, React Hook Form, Zod, Jest + React Testing Library, Vercel

---

## File Map

```
weissesneaker/
├── app/
│   ├── layout.tsx                ← Root layout: fonts, Navigation, Footer, base metadata
│   ├── page.tsx                  ← Homepage: hero, sneaker strip, teasers
│   ├── sneaker/
│   │   └── page.tsx              ← Sneaker overview: FilterBar + grid
│   ├── pflege/
│   │   └── page.tsx              ← Care guide (static content, 6 sections)
│   ├── admin/
│   │   ├── layout.tsx            ← Auth guard → redirects to /admin/login
│   │   ├── login/
│   │   │   └── page.tsx          ← Email/password login form
│   │   ├── page.tsx              ← Sneaker list table + search
│   │   ├── neu/
│   │   │   └── page.tsx          ← "New sneaker" — renders SneakerForm
│   │   ├── [id]/
│   │   │   └── page.tsx          ← "Edit sneaker" — fetches sneaker, renders SneakerForm
│   │   └── actions.ts            ← Server Actions: create, update, delete sneaker
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── Navigation.tsx            ← Sticky header (Server Component)
│   ├── Footer.tsx                ← Affiliate disclaimer (Server Component)
│   ├── AffiliateButton.tsx       ← "use client" CTA button
│   ├── SneakerCard.tsx           ← Product card (Server Component)
│   ├── FilterBar.tsx             ← "use client" Brand/Preis/Style filters
│   └── admin/
│       └── SneakerForm.tsx       ← "use client" shared create/edit form
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser Supabase client (createBrowserClient)
│   │   └── server.ts             ← Server Supabase client (createServerClient + cookies)
│   └── types.ts                  ← Sneaker, SneakerInsert, SneakerUpdate types
├── config/
│   └── affiliates.ts             ← buildAffiliateUrl(), TRACKING_REF constant
├── middleware.ts                  ← Supabase session refresh on every request
├── supabase/
│   ├── schema.sql                ← Table DDL + RLS policies
│   └── seed.sql                  ← 12 sample sneakers
├── __tests__/
│   ├── affiliates.test.ts        ← buildAffiliateUrl unit tests
│   ├── AffiliateButton.test.tsx  ← Component tests
│   └── FilterBar.test.tsx        ← Component tests
├── jest.config.ts
├── jest.setup.ts
└── next.config.ts
```

---

## Task 1: Project Bootstrap & Test Setup

**Files:**
- Create: `next.config.ts`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local`

- [ ] **Step 1.1: Scaffold Next.js project**

Run inside `/Users/swoerner/Desktop/Coding/weissesneaker`:

```bash
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted: accept all defaults. The `.` installs into the current directory.

- [ ] **Step 1.2: Install runtime dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js react-hook-form @hookform/resolvers zod
```

- [ ] **Step 1.3: Install dev dependencies for testing**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 1.4: Write `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 1.5: Write `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 1.6: Add test script to `package.json`**

In `package.json`, find the `"scripts"` block and add:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 1.7: Write `next.config.ts`**

Replace the generated `next.config.ts` with:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // allow any HTTPS image host
    ],
  },
}

export default nextConfig
```

- [ ] **Step 1.8: Create `.env.local`**

```bash
# .env.local — copy from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Fill in your actual Supabase project URL and anon key from https://supabase.com/dashboard → your project → Settings → API.

- [ ] **Step 1.9: Verify project runs**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000, default Next.js page visible.

- [ ] **Step 1.10: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 14 project with test setup"
```

---

## Task 2: TypeScript Types, Supabase Clients & Middleware

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `config/affiliates.ts`
- Create: `middleware.ts`

- [ ] **Step 2.1: Write `lib/types.ts`**

```typescript
export type Badge = 'Bestseller' | 'Neu' | 'Trend' | 'Luxus'
export type Style = 'lifestyle' | 'sport' | 'luxus'

export type Sneaker = {
  id: string
  name: string
  brand: string
  slug: string
  description: string
  price_min: number        // in Cent, z.B. 11000 = 110 €
  image_url: string | null
  affiliate_url: string
  badge: Badge | null
  style: Style
  source: string           // 'manual' | 'awin' | 'amazon' etc.
  active: boolean
  created_at: string
}

export type SneakerInsert = Omit<Sneaker, 'id' | 'created_at'>
export type SneakerUpdate = Partial<SneakerInsert>

export type FilterParams = {
  brand?: string
  preis?: 'unter100' | '100bis200' | 'ueber200'
  style?: Style
}
```

- [ ] **Step 2.2: Write `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2.3: Write `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies are read-only, ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2.4: Write `config/affiliates.ts`**

```typescript
export const TRACKING_REF = 'weissesneaker'

/**
 * Appends ?ref=weissesneaker (or &ref=...) to an affiliate URL.
 * Pure function — safe to test.
 */
export function buildAffiliateUrl(url: string): string {
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}ref=${TRACKING_REF}`
}
```

- [ ] **Step 2.5: Write `middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Supabase Auth to work with SSR
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2.6: Write failing test for `buildAffiliateUrl`**

Create `__tests__/affiliates.test.ts`:

```typescript
import { buildAffiliateUrl, TRACKING_REF } from '@/config/affiliates'

describe('buildAffiliateUrl', () => {
  it('appends ?ref=weissesneaker to a URL without query params', () => {
    const result = buildAffiliateUrl('https://www.awin1.com/cread.php')
    expect(result).toBe('https://www.awin1.com/cread.php?ref=weissesneaker')
  })

  it('appends &ref=weissesneaker to a URL that already has query params', () => {
    const result = buildAffiliateUrl('https://www.awin1.com/cread.php?awinmid=123')
    expect(result).toBe('https://www.awin1.com/cread.php?awinmid=123&ref=weissesneaker')
  })

  it('returns empty string unchanged', () => {
    expect(buildAffiliateUrl('')).toBe('')
  })

  it('uses the TRACKING_REF constant', () => {
    expect(TRACKING_REF).toBe('weissesneaker')
  })
})
```

- [ ] **Step 2.7: Run test — verify it passes**

```bash
npm test -- --testPathPattern=affiliates
```

Expected: 4 tests pass.

- [ ] **Step 2.8: Commit**

```bash
git add -A
git commit -m "feat: add types, supabase clients, affiliate util, middleware"
```

---

## Task 3: Supabase Schema, RLS & Seed Data

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 3.1: Write `supabase/schema.sql`**

```sql
-- Run this in Supabase Dashboard → SQL Editor

-- Sneakers table
create table if not exists sneakers (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  brand        text        not null,
  slug         text        not null unique,
  description  text        not null,
  price_min    integer     not null,  -- in Cent
  image_url    text,
  affiliate_url text       not null,
  badge        text        check (badge in ('Bestseller', 'Neu', 'Trend', 'Luxus')),
  style        text        not null check (style in ('lifestyle', 'sport', 'luxus')),
  source       text        not null default 'manual',
  active       boolean     not null default true,
  created_at   timestamptz default now()
);

-- Row Level Security
alter table sneakers enable row level security;

-- Anon users: read active sneakers only
create policy "Public read active sneakers"
  on sneakers for select
  using (active = true);

-- Authenticated users (admin): full access
create policy "Authenticated full access"
  on sneakers for all
  to authenticated
  using (true)
  with check (true);
```

- [ ] **Step 3.2: Run schema in Supabase**

1. Go to https://supabase.com/dashboard → your project → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**
4. Confirm: no errors, table `sneakers` appears in Table Editor

- [ ] **Step 3.3: Write `supabase/seed.sql`**

```sql
-- Run in Supabase SQL Editor after schema.sql

insert into sneakers (name, brand, slug, description, price_min, image_url, affiliate_url, badge, style, source, active)
values
  (
    'Air Force 1', 'Nike', 'nike-air-force-1',
    'Der zeitlose Klassiker mit superweicher Ledersohle – seit 1982 unschlagbar clean. Perfekt zu Jeans, Chinos oder Jogginghose.',
    11000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=nike-air-force-1',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Stan Smith', 'Adidas', 'adidas-stan-smith',
    'Ikonisches Tennis-Modell mit minimalistischem Design, das seit den 70ern Stil definiert. Vegane Version erhältlich.',
    9000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=adidas-stan-smith',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    '574', 'New Balance', 'new-balance-574',
    'Chunky Silhouette trifft auf maximalen Tragekomfort – der 574 ist der Allrounder unter den weißen Sneakern.',
    12000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=new-balance-574',
    'Neu', 'lifestyle', 'manual', true
  ),
  (
    'Achilles Low', 'Common Projects', 'common-projects-achilles-low',
    'Handgefertigtes italienisches Leder, minimales Design, goldene Seriennummer – das Nonplusultra für Minimalisten mit Anspruch.',
    42000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=common-projects-achilles-low',
    'Luxus', 'luxus', 'manual', true
  ),
  (
    'V-10', 'Veja', 'veja-v-10',
    'Nachhaltig produziert aus Bio-Baumwolle und Amazonas-Kautschuk – der weiße Sneaker mit gutem Gewissen.',
    15000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=veja-v-10',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    'Cloud 5', 'On Running', 'on-running-cloud-5',
    'Revolutionäre CloudTec-Sohle für maximale Dämpfung – läuft wie auf Wolken, sieht dabei noch gut aus.',
    17000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=on-running-cloud-5',
    'Neu', 'sport', 'manual', true
  ),
  (
    'Suede Classic', 'Puma', 'puma-suede-classic',
    'Streetwear-Ikone seit 1968 – das weiche Wildleder-Obermaterial und die saubere Silhouette machen ihn zeitlos.',
    8000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=puma-suede-classic',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Chuck Taylor All Star', 'Converse', 'converse-chuck-taylor',
    'Der ultimative Jugendkult-Sneaker – vulkanisierte Sohle, ikonisches Design, unschlagbarer Preis.',
    7000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=converse-chuck-taylor',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Low Top', 'Filling Pieces', 'filling-pieces-low-top',
    'Amsterdamer Premium-Label trifft auf handgenähtes Leder – eine europäische Alternative zu Common Projects.',
    28000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=filling-pieces-low-top',
    'Luxus', 'luxus', 'manual', true
  ),
  (
    'Graduate', 'Lacoste', 'lacoste-graduate',
    'Cleane Silhouette mit dem berühmten Krokodil-Logo – der Graduate ist Lacoste puristisch und zeitlos.',
    10000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=lacoste-graduate',
    'Neu', 'lifestyle', 'manual', true
  ),
  (
    'Club C 85', 'Reebok', 'reebok-club-c-85',
    'Tennis-Erbe aus den 80ern in schneeweißem Leder – schlicht, clean, und dabei erstaunlich vielseitig kombinierbar.',
    8500, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=reebok-club-c-85',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    'Gel-Lyte III', 'Asics', 'asics-gel-lyte-iii',
    'Kult-Laufschuh der 90er mit Split-Tongue und GEL-Dämpfung – heute der Streetwear-Tipp für Kenner.',
    13000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=asics-gel-lyte-iii',
    'Trend', 'sport', 'manual', true
  );
```

- [ ] **Step 3.4: Run seed in Supabase**

1. SQL Editor → paste `supabase/seed.sql` → Run
2. Confirm: Table Editor shows 12 rows in `sneakers`

- [ ] **Step 3.5: Create admin user**

In Supabase Dashboard → Authentication → Users → **Add user**:
- Email: deine E-Mail-Adresse
- Password: sicheres Passwort
- Auto-confirm: ✅

- [ ] **Step 3.6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema, RLS policies, and seed data"
```

---

## Task 4: Root Layout, Navigation & Footer

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Navigation.tsx`
- Create: `components/Footer.tsx`

- [ ] **Step 4.1: Write `components/Navigation.tsx`**

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-[#E8E0D5]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-playfair text-lg font-bold tracking-widest text-[#1A1A1A] uppercase"
        >
          Weissesneaker
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/sneaker"
            className="font-dm-sans text-sm tracking-wider text-[#1A1A1A] hover:text-[#888] transition-colors uppercase"
          >
            Sneaker
          </Link>
          <Link
            href="/pflege"
            className="font-dm-sans text-sm tracking-wider text-[#1A1A1A] hover:text-[#888] transition-colors uppercase"
          >
            Pflege
          </Link>
        </div>

        {/* Mobile: simple text links */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/sneaker" className="text-sm text-[#1A1A1A]">Sneaker</Link>
          <Link href="/pflege" className="text-sm text-[#1A1A1A]">Pflege</Link>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4.2: Write `components/Footer.tsx`**

```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#FAFAFA] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-playfair text-lg font-bold tracking-widest uppercase mb-3">
              Weissesneaker.de
            </p>
            <p className="text-sm text-[#888] max-w-sm leading-relaxed">
              Diese Seite enthält Affiliate-Links. Bei einem Kauf über diese
              Links erhalten wir eine kleine Provision – für dich entstehen
              keine Mehrkosten.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/sneaker" className="text-sm text-[#888] hover:text-[#E8E0D5] transition-colors">
              Sneaker
            </Link>
            <Link href="/pflege" className="text-sm text-[#888] hover:text-[#E8E0D5] transition-colors">
              Pflege
            </Link>
          </div>
        </div>
        <div className="border-t border-[#333] mt-8 pt-6 text-xs text-[#555]">
          © {new Date().getFullYear()} weissesneaker.de · Alle Rechte vorbehalten
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4.3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Die besten weißen Sneaker 2025 | weissesneaker.de',
    template: '%s | weissesneaker.de',
  },
  description:
    'Unsere Top-Picks für weiße Sneaker 2025 – kuratiert, unabhängig, ehrlich. Nike, Adidas, Veja und mehr.',
  metadataBase: new URL('https://weissesneaker.de'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#FAFAFA] text-[#1A1A1A] font-[family-name:var(--font-dm-sans)] antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 4.4: Add font utilities to `tailwind.config.ts`**

Open `tailwind.config.ts` and add inside `theme.extend`:

```typescript
fontFamily: {
  playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
  'dm-sans': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
},
```

- [ ] **Step 4.5: Verify layout renders**

```bash
npm run dev
```

Open http://localhost:3000 — verify: sticky nav with "Weissesneaker" logo and "Sneaker / Pflege" links, black footer at bottom with disclaimer text.

- [ ] **Step 4.6: Commit**

```bash
git add -A
git commit -m "feat: add root layout, Navigation, Footer with affiliate disclaimer"
```

---

## Task 5: AffiliateButton Component

**Files:**
- Create: `components/AffiliateButton.tsx`
- Create: `__tests__/AffiliateButton.test.tsx`

- [ ] **Step 5.1: Write failing test**

Create `__tests__/AffiliateButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AffiliateButton from '@/components/AffiliateButton'

describe('AffiliateButton', () => {
  it('renders with correct label', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    expect(screen.getByRole('link', { name: 'Jetzt kaufen' })).toBeInTheDocument()
  })

  it('appends ref tracking parameter to the URL', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    const link = screen.getByRole('link', { name: 'Jetzt kaufen' })
    expect(link).toHaveAttribute('href', 'https://www.awin1.com/cread.php?ref=weissesneaker')
  })

  it('opens in a new tab with security attributes', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    const link = screen.getByRole('link', { name: 'Jetzt kaufen' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored')
  })
})
```

- [ ] **Step 5.2: Run test — verify it fails**

```bash
npm test -- --testPathPattern=AffiliateButton
```

Expected: FAIL — "Cannot find module '@/components/AffiliateButton'"

- [ ] **Step 5.3: Write `components/AffiliateButton.tsx`**

```tsx
'use client'

import { buildAffiliateUrl } from '@/config/affiliates'

type Props = {
  affiliateUrl: string
  label?: string
  className?: string
}

export default function AffiliateButton({
  affiliateUrl,
  label = 'Jetzt kaufen',
  className,
}: Props) {
  const href = buildAffiliateUrl(affiliateUrl)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={
        className ??
        'inline-block bg-[#1A1A1A] text-[#FAFAFA] text-xs font-dm-sans tracking-widest uppercase px-5 py-3 hover:bg-[#333] transition-colors'
      }
    >
      {label}
    </a>
  )
}
```

- [ ] **Step 5.4: Run test — verify it passes**

```bash
npm test -- --testPathPattern=AffiliateButton
```

Expected: 3 tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add components/AffiliateButton.tsx __tests__/AffiliateButton.test.tsx
git commit -m "feat: add AffiliateButton component with tracking URL"
```

---

## Task 6: SneakerCard Component

**Files:**
- Create: `components/SneakerCard.tsx`

- [ ] **Step 6.1: Write `components/SneakerCard.tsx`**

```tsx
import Image from 'next/image'
import type { Sneaker } from '@/lib/types'
import AffiliateButton from './AffiliateButton'

const BADGE_STYLES: Record<string, string> = {
  Bestseller: 'bg-[#1A1A1A] text-[#E8E0D5]',
  Trend:      'bg-[#1A1A1A] text-[#E8E0D5]',
  Neu:        'bg-[#E8E0D5] text-[#1A1A1A]',
  Luxus:      'bg-[#E8E0D5] text-[#1A1A1A]',
}

type Props = {
  sneaker: Sneaker
}

export default function SneakerCard({ sneaker }: Props) {
  const { name, brand, description, price_min, image_url, affiliate_url, badge } = sneaker
  const priceEur = (price_min / 100).toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <article className="bg-white border border-[#eee] group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative bg-[#F5F5F5] aspect-[4/3] overflow-hidden">
        {badge && (
          <span
            className={`absolute top-3 left-3 z-10 text-[10px] font-dm-sans tracking-widest uppercase px-2 py-1 ${BADGE_STYLES[badge] ?? 'bg-[#1A1A1A] text-[#FAFAFA]'}`}
          >
            {badge}
          </span>
        )}
        {image_url ? (
          <Image
            src={image_url}
            alt={`${name} von ${brand} – weißer Sneaker`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#ccc] text-sm font-dm-sans">
            Bild folgt
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#888] uppercase tracking-wider mb-1 font-dm-sans">{brand}</p>
        <h3 className="font-playfair text-base font-bold mb-2">{name}</h3>
        <p className="text-sm text-[#555] leading-relaxed mb-4 flex-1 font-dm-sans">{description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0f0f0]">
          <span className="font-playfair font-bold text-base">ab {priceEur} €</span>
          <AffiliateButton affiliateUrl={affiliate_url} />
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 6.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6.3: Commit**

```bash
git add components/SneakerCard.tsx
git commit -m "feat: add SneakerCard component (Hochformat/Klassisch design)"
```

---

## Task 7: Homepage (`/`)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 7.1: Write `app/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import SneakerCard from '@/components/SneakerCard'

export const metadata: Metadata = {
  title: 'Die besten weißen Sneaker 2025 | weissesneaker.de',
  description:
    'Unsere Top-Picks für weiße Sneaker 2025 – kuratiert, unabhängig, ehrlich.',
}

async function getFeaturedSneakers(): Promise<Sneaker[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sneakers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) throw new Error(error.message)
  return data ?? []
}

export default async function HomePage() {
  const sneakers = await getFeaturedSneakers()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1A1A1A] overflow-hidden">
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36 text-center">
          <p className="font-dm-sans text-[10px] tracking-[6px] text-[#E8E0D5] uppercase mb-4">
            Weissesneaker.de — 2025
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Die besten weißen
            <br />
            Sneaker 2025
          </h1>
          <p className="font-dm-sans text-sm text-[#888] mb-10 tracking-wider">
            Testberichte · Preisvergleich · Pflege-Tipps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sneaker"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 border border-[#E8E0D5] text-[#E8E0D5] hover:bg-[#E8E0D5] hover:text-[#1A1A1A] transition-colors"
            >
              Alle Sneaker
            </Link>
            <Link
              href="/sneaker?badge=Bestseller"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 bg-[#E8E0D5] text-[#1A1A1A] hover:bg-white transition-colors"
            >
              Top Picks
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sneaker Strip */}
      {sneakers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-playfair text-2xl font-bold mb-8">Aktuell beliebt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sneakers.map((sneaker) => (
              <SneakerCard key={sneaker.id} sneaker={sneaker} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/sneaker"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors inline-block"
            >
              Alle {sneakers.length > 8 ? 'Sneaker anzeigen' : 'ansehen'}
            </Link>
          </div>
        </section>
      )}

      {/* Warum weiße Sneaker */}
      <section className="bg-[#E8E0D5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-playfair text-3xl font-bold mb-6">
            Warum weiße Sneaker?
          </h2>
          <p className="font-dm-sans text-[#555] leading-relaxed text-base">
            Weiße Sneaker sind das vielseitigste Schuhwerk, das du besitzen kannst. 
            Sie passen zu Businesslook und Streetwear gleichermaßen, machen jeden 
            Outfit cleaner und sind seit Jahrzehnten ein zeitloser Klassiker. 
            Kein anderer Schuh verbindet Stil, Komfort und Wandlungsfähigkeit 
            auf diese Art und Weise.
          </p>
        </div>
      </section>

      {/* Pflege-Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-[#eee] p-8 md:p-12">
          <div className="flex-1">
            <p className="font-dm-sans text-xs tracking-widest uppercase text-[#888] mb-3">
              Pflegehinweise
            </p>
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Weiße Sneaker sauber halten
            </h2>
            <p className="font-dm-sans text-[#555] leading-relaxed mb-6">
              Von der schnellen Grundreinigung bis zur Tiefenpflege nach Material –
              unsere Anleitung hält deine weißen Sneaker strahlend weiß.
            </p>
            <Link
              href="/pflege"
              className="font-dm-sans text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors inline-block"
            >
              Zur Pflegeanleitung
            </Link>
          </div>
          <div className="hidden md:block w-48 h-48 bg-[#F5F5F5] flex-shrink-0" />
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'weissesneaker.de',
            url: 'https://weissesneaker.de',
            description:
              'Die besten weißen Sneaker 2025 – kuratiert, unabhängig, ehrlich.',
          }),
        }}
      />
    </>
  )
}
```

- [ ] **Step 7.2: Verify page loads with data**

```bash
npm run dev
```

Open http://localhost:3000 — expect: black hero with headline, sneaker grid below (if Supabase is connected and seed data exists), beige teaser section, pflege CTA.

- [ ] **Step 7.3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add homepage with hero, sneaker strip, and teaser sections"
```

---

## Task 8: FilterBar Component

**Files:**
- Create: `components/FilterBar.tsx`
- Create: `__tests__/FilterBar.test.tsx`

- [ ] **Step 8.1: Write failing test**

Create `__tests__/FilterBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation before import
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/sneaker',
}))

import FilterBar from '@/components/FilterBar'

const BRANDS = ['Nike', 'Adidas', 'New Balance', 'Common Projects', 'Veja']

describe('FilterBar', () => {
  it('renders all filter sections', () => {
    render(<FilterBar brands={BRANDS} />)
    expect(screen.getByLabelText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Alle')).toBeInTheDocument()
    expect(screen.getByText('Lifestyle')).toBeInTheDocument()
    expect(screen.getByText('Sport')).toBeInTheDocument()
    expect(screen.getByText('Luxus')).toBeInTheDocument()
  })

  it('renders brand options from props', () => {
    render(<FilterBar brands={BRANDS} />)
    const select = screen.getByLabelText('Brand') as HTMLSelectElement
    BRANDS.forEach((brand) => {
      expect(screen.getByRole('option', { name: brand })).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 8.2: Run test — verify it fails**

```bash
npm test -- --testPathPattern=FilterBar
```

Expected: FAIL — "Cannot find module '@/components/FilterBar'"

- [ ] **Step 8.3: Write `components/FilterBar.tsx`**

```tsx
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const PRICE_OPTIONS = [
  { label: 'Alle Preise', value: '' },
  { label: 'Unter 100 €', value: 'unter100' },
  { label: '100 – 200 €', value: '100bis200' },
  { label: 'Über 200 €', value: 'ueber200' },
]

const STYLE_OPTIONS = [
  { label: 'Alle', value: '' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Sport', value: 'sport' },
  { label: 'Luxus', value: 'luxus' },
]

type Props = {
  brands: string[]
}

export default function FilterBar({ brands }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const currentBrand = searchParams.get('brand') ?? ''
  const currentPreis = searchParams.get('preis') ?? ''
  const currentStyle = searchParams.get('style') ?? ''

  return (
    <div className="flex flex-wrap gap-4 items-end pb-6 border-b border-[#eee] mb-8 font-dm-sans">
      {/* Brand */}
      <div className="flex flex-col gap-1">
        <label htmlFor="brand-filter" className="text-[10px] tracking-widest uppercase text-[#888]">
          Brand
        </label>
        <select
          id="brand-filter"
          aria-label="Brand"
          value={currentBrand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          className="border border-[#ddd] bg-white text-sm px-3 py-2 min-w-[140px] focus:outline-none focus:border-[#1A1A1A]"
        >
          <option value="">Alle Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Preis */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-widest uppercase text-[#888]">Preisspanne</span>
        <div className="flex gap-1">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('preis', opt.value)}
              className={`text-xs px-3 py-2 border transition-colors ${
                currentPreis === opt.value
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#ddd] hover:border-[#1A1A1A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-widest uppercase text-[#888]">Style</span>
        <div className="flex gap-1">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('style', opt.value)}
              className={`text-xs px-3 py-2 border transition-colors ${
                currentStyle === opt.value
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#ddd] hover:border-[#1A1A1A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.4: Run test — verify it passes**

```bash
npm test -- --testPathPattern=FilterBar
```

Expected: 2 tests pass.

- [ ] **Step 8.5: Commit**

```bash
git add components/FilterBar.tsx __tests__/FilterBar.test.tsx
git commit -m "feat: add FilterBar component with URL-based brand/price/style filters"
```

---

## Task 9: Sneaker Overview Page (`/sneaker`)

**Files:**
- Create: `app/sneaker/page.tsx`

- [ ] **Step 9.1: Write `app/sneaker/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker, FilterParams } from '@/lib/types'
import SneakerCard from '@/components/SneakerCard'
import FilterBar from '@/components/FilterBar'

export const metadata: Metadata = {
  title: 'Weiße Sneaker kaufen – Top 12 Empfehlungen 2025',
  description:
    'Die schönsten weißen Sneaker im Vergleich: Nike, Adidas, Veja, Common Projects und mehr.',
}

async function getSneakers(filters: FilterParams): Promise<Sneaker[]> {
  const supabase = createClient()
  let query = supabase.from('sneakers').select('*').eq('active', true)

  if (filters.brand) {
    query = query.eq('brand', filters.brand)
  }
  if (filters.style) {
    query = query.eq('style', filters.style)
  }
  if (filters.preis === 'unter100') {
    query = query.lt('price_min', 10000)
  } else if (filters.preis === '100bis200') {
    query = query.gte('price_min', 10000).lte('price_min', 20000)
  } else if (filters.preis === 'ueber200') {
    query = query.gt('price_min', 20000)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

async function getAllBrands(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('sneakers')
    .select('brand')
    .eq('active', true)
  const brands = [...new Set((data ?? []).map((r) => r.brand as string))].sort()
  return brands
}

type PageProps = {
  searchParams: { brand?: string; preis?: string; style?: string }
}

export default async function SneakerPage({ searchParams }: PageProps) {
  const filters: FilterParams = {
    brand: searchParams.brand,
    preis: searchParams.preis as FilterParams['preis'],
    style: searchParams.style as FilterParams['style'],
  }

  const [sneakers, brands] = await Promise.all([
    getSneakers(filters),
    getAllBrands(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-2">
          Weiße Sneaker 2025
        </h1>
        <p className="font-dm-sans text-[#888] text-sm">
          {sneakers.length} Modelle
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterBar brands={brands} />
      </Suspense>

      {sneakers.length === 0 ? (
        <div className="text-center py-24 text-[#888] font-dm-sans">
          Keine Sneaker für diese Filterauswahl gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sneakers.map((sneaker) => (
            <SneakerCard key={sneaker.id} sneaker={sneaker} />
          ))}
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Weiße Sneaker 2025',
            url: 'https://weissesneaker.de/sneaker',
            numberOfItems: sneakers.length,
            itemListElement: sneakers.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: s.name,
                brand: { '@type': 'Brand', name: s.brand },
                offers: {
                  '@type': 'Offer',
                  price: (s.price_min / 100).toFixed(2),
                  priceCurrency: 'EUR',
                  url: s.affiliate_url,
                },
              },
            })),
          }),
        }}
      />
    </div>
  )
}
```

- [ ] **Step 9.2: Verify page with filters**

```bash
npm run dev
```

Open http://localhost:3000/sneaker — expect: 12 sneaker cards in a 3-column grid.
Open http://localhost:3000/sneaker?style=luxus — expect: only Achilles Low + Filling Pieces Low Top.
Open http://localhost:3000/sneaker?brand=Nike — expect: only Air Force 1.

- [ ] **Step 9.3: Commit**

```bash
git add app/sneaker/
git commit -m "feat: add /sneaker page with server-side filtering via URL params"
```

---

## Task 10: Pflege Page (`/pflege`)

**Files:**
- Create: `app/pflege/page.tsx`

- [ ] **Step 10.1: Write `app/pflege/page.tsx`**

```tsx
import type { Metadata } from 'next'
import AffiliateButton from '@/components/AffiliateButton'

export const metadata: Metadata = {
  title: 'Weiße Sneaker reinigen & pflegen – Die ultimative Anleitung',
  description:
    'Schritt-für-Schritt-Anleitungen für saubere, strahlend weiße Sneaker – nach Material, Verschmutzungsgrad und Lagerung.',
}

const sections = [
  {
    number: '01',
    title: 'Grundreinigung',
    content: `
      Für die schnelle Reinigung nach jedem Tragen brauchst du nur wenig: eine weiche Bürste,
      mildes Spülmittel und warmes Wasser. Klopfe zunächst groben Schmutz ab. Mische einen
      Teelöffel Spülmittel mit 200 ml warmem Wasser und bearbeite Oberfläche und Sohle mit
      einer Schuhbürste in kreisenden Bewegungen. Wische mit einem feuchten Tuch nach und
      lass den Sneaker bei Zimmertemperatur trocknen – niemals direkt in der Sonne oder am Heizkörper.
    `,
  },
  {
    number: '02',
    title: 'Tiefenreinigung für Hartnäckiges',
    content: `
      Bei eingetrockneten Flecken hilft eine Paste aus Backpulver und Wasser (2:1). Auftragen,
      10 Minuten einwirken lassen, dann mit einer alten Zahnbürste in kleinen Kreisen abreiben.
      Für Gummisohlen funktioniert ein Radiergummi oder Nagellackentferner (ohne Aceton) auf
      Wattepads. Wichtig: Immer erst an einer unauffälligen Stelle testen.
    `,
  },
  {
    number: '03',
    title: 'Pflege nach Material',
    content: `
      **Leder & Kunstleder:** Nach der Reinigung unbedingt mit Lederbalsam oder -creme pflegen,
      damit das Material nicht austrocknet und rissig wird.

      **Canvas (Stoff):** Kann bei 30°C in der Waschmaschine gewaschen werden – Schnürsenkel
      vorher entfernen, in einem Wäschenetz waschen, bei Zimmertemperatur trocknen.

      **Mesh:** Sehr empfindlich, niemals schrubben. Nur mit weichem Tuch und wenig Wasser betupfen.

      **Wildleder/Nubuk:** Nie nass waschen. Spezial-Wildlederbürste für trockene Verschmutzungen,
      Wildleder-Imprägnierung nach jeder Reinigung auftragen.
    `,
  },
  {
    number: '04',
    title: 'Weißmachen & Aufhellen',
    content: `
      Vergilbte Sohlen lassen sich mit einem Gemisch aus Wasserstoffperoxid (3 %) und
      Backpulver aufhellen. Paste auftragen, Sneaker in der Sonne platzieren (UV aktiviert den
      Effekt), nach 30–60 Minuten abspülen. Für das Obermaterial hilft Zahnpasta (weiße,
      ohne Gel) auf einer Zahnbürste – kurz einreiben, abwischen, wiederholen.
      Kommerziell: Jason Markk, Crep Protect und Sneaker Eraser liefern sehr gute Ergebnisse.
    `,
  },
  {
    number: '05',
    title: 'Lagerung & Prävention',
    content: `
      Weiße Sneaker vergilben durch UV-Licht und Sauerstoff. Lagere sie in ihrer Originalbox
      oder in transparenten Schuhboxen – kühl, trocken und lichtgeschützt. Silicagel-Beutel
      in der Box binden Feuchtigkeit. Vor dem Tragen immer Imprägnierspray auftragen
      (Abstand 30 cm, zwei Schichten, 24 h trocknen lassen). Tipp: Wechsle zwischen
      mehreren Paaren, damit jeder Sneaker nach dem Tragen vollständig austrocknen kann.
    `,
  },
]

export default function PflegePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <p className="font-dm-sans text-xs tracking-widest uppercase text-[#888] mb-3">
          Pflegehinweise
        </p>
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
          Weiße Sneaker reinigen & pflegen
        </h1>
        <p className="font-dm-sans text-[#555] text-base leading-relaxed">
          Weiße Sneaker sind wunderschön – aber empfindlich. Diese Anleitung zeigt,
          wie du sie sauber hältst, aufhellst und lange weiß hältst.
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.number} className="flex gap-6">
            <div className="flex-shrink-0">
              <span className="font-playfair text-4xl font-bold text-[#E8E0D5]">
                {section.number}
              </span>
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold mb-3">{section.title}</h2>
              <div className="font-dm-sans text-[#555] text-sm leading-relaxed space-y-2">
                {section.content.trim().split('\n\n').map((para, i) => (
                  <p key={i}>{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Produktempfehlungen */}
        <section className="flex gap-6">
          <div className="flex-shrink-0">
            <span className="font-playfair text-4xl font-bold text-[#E8E0D5]">06</span>
          </div>
          <div>
            <h2 className="font-playfair text-xl font-bold mb-3">
              Produktempfehlungen
            </h2>
            <p className="font-dm-sans text-[#555] text-sm leading-relaxed mb-6">
              Diese Pflegeprodukte haben wir getestet und empfehlen sie
              uneingeschränkt für weiße Sneaker:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: 'Jason Markk Essential Kit',
                  desc: 'Das Original – Reinigungslösung + Premium-Bürste. Für alle Materialien geeignet.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=jason-markk',
                },
                {
                  name: 'Crep Protect Cure',
                  desc: 'Schaumreiniger für hartnäckige Flecken. Besonders effektiv auf Gummisohlen.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=crep-protect',
                },
                {
                  name: 'Sneaker Shield Imprägnierung',
                  desc: 'Unsichtbarer Schutzfilm vor Schmutz und Wasser – ideal vor dem ersten Tragen.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=sneaker-shield',
                },
                {
                  name: 'Sneaker Lab Whitener',
                  desc: 'Spezifisch für vergilbte Sohlen und Obermaterial – restauriert das Weiß.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=sneaker-lab-whitener',
                },
              ].map((product) => (
                <div key={product.name} className="border border-[#eee] p-4 bg-white">
                  <h3 className="font-playfair font-bold text-sm mb-1">{product.name}</h3>
                  <p className="font-dm-sans text-xs text-[#888] mb-4 leading-relaxed">
                    {product.desc}
                  </p>
                  <AffiliateButton affiliateUrl={product.url} label="Ansehen" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 10.2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/pflege — expect: numbered guide sections (01–06), Produktempfehlungen at the bottom with AffiliateButton links.

- [ ] **Step 10.3: Commit**

```bash
git add app/pflege/
git commit -m "feat: add /pflege care guide page with 6 sections and product recommendations"
```

---

## Task 11: Admin Auth — Layout Guard & Login Page

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 11.1: Write `app/admin/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Admin Nav */}
      <header className="bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-dm-sans text-[10px] tracking-widest uppercase text-[#E8E0D5]">
              Weissesneaker · Admin
            </span>
            <Link
              href="/admin"
              className="text-xs text-[#888] hover:text-white transition-colors"
            >
              Sneaker
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#888]">
            <span>{user.email}</span>
            <form action="/admin/logout" method="post">
              <button type="submit" className="text-[#E8E0D5] hover:text-white transition-colors">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 11.2: Write `app/admin/login/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Login fehlgeschlagen. E-Mail oder Passwort falsch.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-playfair text-2xl font-bold text-center mb-8">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#888] mb-1 font-dm-sans">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#ddd] px-3 py-2 text-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#888] mb-1 font-dm-sans">
              Passwort
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#ddd] px-3 py-2 text-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 font-dm-sans">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white text-xs tracking-widest uppercase py-3 hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 11.3: Add logout route `app/admin/logout/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

- [ ] **Step 11.4: Verify auth flow**

```bash
npm run dev
```

1. Open http://localhost:3000/admin — expect: redirected to `/admin/login`
2. Enter wrong credentials — expect: error message
3. Enter correct credentials (the user you created in Task 3) — expect: redirected to `/admin`

- [ ] **Step 11.5: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin auth layout guard, login page, and logout route"
```

---

## Task 12: Admin Sneaker List

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 12.1: Write `app/admin/page.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import { deleteSneaker } from './actions'

async function getAllSneakers(): Promise<Sneaker[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sneakers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export default async function AdminSneakerList() {
  const sneakers = await getAllSneakers()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold">
          Sneaker ({sneakers.length})
        </h1>
        <Link
          href="/admin/neu"
          className="bg-[#1A1A1A] text-white text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#333] transition-colors"
        >
          + Neuer Sneaker
        </Link>
      </div>

      <div className="bg-white border border-[#eee] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-[#F5F5F5] text-[10px] font-dm-sans tracking-widest uppercase text-[#888]">
          <div>Name</div>
          <div>Brand</div>
          <div>Preis</div>
          <div>Status</div>
          <div>Aktionen</div>
        </div>

        {sneakers.length === 0 && (
          <div className="px-4 py-8 text-center text-[#888] font-dm-sans text-sm">
            Noch keine Sneaker. Klick auf "+ Neuer Sneaker".
          </div>
        )}

        {sneakers.map((sneaker) => (
          <div
            key={sneaker.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-t border-[#f0f0f0] items-center"
          >
            <div className="font-playfair font-semibold text-sm">{sneaker.name}</div>
            <div className="font-dm-sans text-sm text-[#666]">{sneaker.brand}</div>
            <div className="font-dm-sans text-sm">
              {(sneaker.price_min / 100).toLocaleString('de-DE')} €
            </div>
            <div>
              <span
                className={`text-[10px] font-dm-sans tracking-wider px-2 py-1 ${
                  sneaker.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sneaker.active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/${sneaker.id}`}
                className="text-xs font-dm-sans text-[#555] hover:text-[#1A1A1A] transition-colors"
              >
                Bearbeiten
              </Link>
              <form action={deleteSneaker.bind(null, sneaker.id)}>
                <button
                  type="submit"
                  className="text-xs font-dm-sans text-red-500 hover:text-red-700 transition-colors"
                  onClick={(e) => {
                    if (!confirm(`"${sneaker.name}" wirklich löschen?`)) {
                      e.preventDefault()
                    }
                  }}
                >
                  Löschen
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 12.2: Create stub for actions (needed for import above)**

Create `app/admin/actions.ts` with just the `deleteSneaker` stub (full implementation in Task 13):

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SneakerInsert } from '@/lib/types'
import { z } from 'zod'

export async function deleteSneaker(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('sneakers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/sneaker')
  revalidatePath('/admin')
}

export async function createSneaker(_prevState: unknown, _formData: FormData): Promise<{ error?: string }> {
  // Implemented in Task 13
  return {}
}

export async function updateSneaker(_id: string, _prevState: unknown, _formData: FormData): Promise<{ error?: string }> {
  // Implemented in Task 13
  return {}
}
```

- [ ] **Step 12.3: Verify admin list**

```bash
npm run dev
```

Log in at http://localhost:3000/admin/login → expect: admin list showing all 12 sneakers with Bearbeiten/Löschen links.

- [ ] **Step 12.4: Commit**

```bash
git add app/admin/page.tsx app/admin/actions.ts
git commit -m "feat: add admin sneaker list with delete action"
```

---

## Task 13: Admin Server Actions & Sneaker Form

**Files:**
- Modify: `app/admin/actions.ts`
- Create: `components/admin/SneakerForm.tsx`
- Create: `app/admin/neu/page.tsx`
- Create: `app/admin/[id]/page.tsx`

- [ ] **Step 13.1: Replace `app/admin/actions.ts` with full implementation**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SneakerSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  brand: z.string().min(1, 'Brand ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich').regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  description: z.string().min(10, 'Beschreibung zu kurz (min. 10 Zeichen)'),
  price_min: z.coerce.number().int().positive('Preis muss positiv sein'),
  image_url: z.string().url('Keine gültige URL').or(z.literal('')).optional(),
  affiliate_url: z.string().url('Keine gültige Affiliate-URL'),
  badge: z.enum(['Bestseller', 'Neu', 'Trend', 'Luxus', '']).optional(),
  style: z.enum(['lifestyle', 'sport', 'luxus']),
  source: z.string().default('manual'),
  active: z.coerce.boolean(),
})

type ActionState = { error?: string }

export async function deleteSneaker(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('sneakers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/sneaker')
  revalidatePath('/admin')
}

export async function createSneaker(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = SneakerSchema.safeParse({
    ...raw,
    price_min: Math.round(Number(raw.price_min) * 100), // € → Cent
    active: raw.active === 'on' || raw.active === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const data = {
    ...parsed.data,
    badge: parsed.data.badge || null,
    image_url: parsed.data.image_url || null,
  }

  const supabase = createClient()
  const { error } = await supabase.from('sneakers').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/sneaker')
  redirect('/admin')
}

export async function updateSneaker(id: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = SneakerSchema.safeParse({
    ...raw,
    price_min: Math.round(Number(raw.price_min) * 100),
    active: raw.active === 'on' || raw.active === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const data = {
    ...parsed.data,
    badge: parsed.data.badge || null,
    image_url: parsed.data.image_url || null,
  }

  const supabase = createClient()
  const { error } = await supabase.from('sneakers').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/sneaker')
  redirect('/admin')
}
```

- [ ] **Step 13.2: Write `components/admin/SneakerForm.tsx`**

```tsx
'use client'

import { useFormState } from 'react-dom'
import type { Sneaker } from '@/lib/types'

type Props = {
  sneaker?: Sneaker
  action: (prevState: { error?: string }, formData: FormData) => Promise<{ error?: string }>
}

const FIELD = 'border border-[#ddd] bg-white px-3 py-2 text-sm w-full focus:outline-none focus:border-[#1A1A1A] font-dm-sans'
const LABEL = 'block text-[10px] tracking-widest uppercase text-[#888] mb-1 font-dm-sans'

export default function SneakerForm({ sneaker, action }: Props) {
  const [state, formAction] = useFormState(action, {})
  const isEdit = !!sneaker

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-dm-sans">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Name *</label>
          <input name="name" required defaultValue={sneaker?.name} className={FIELD} placeholder="z.B. Air Force 1" />
        </div>
        <div>
          <label className={LABEL}>Brand *</label>
          <input name="brand" required defaultValue={sneaker?.brand} className={FIELD} placeholder="z.B. Nike" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Slug * (URL-Pfad, z.B. nike-air-force-1)</label>
        <input name="slug" required defaultValue={sneaker?.slug} className={FIELD} placeholder="nike-air-force-1" pattern="[a-z0-9-]+" />
      </div>

      <div>
        <label className={LABEL}>Beschreibung * (2 Sätze)</label>
        <textarea name="description" required defaultValue={sneaker?.description} rows={3} className={FIELD} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Preis ab (€) *</label>
          <input
            name="price_min"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={sneaker ? (sneaker.price_min / 100).toFixed(2) : ''}
            className={FIELD}
            placeholder="110.00"
          />
        </div>
        <div>
          <label className={LABEL}>Badge</label>
          <select name="badge" defaultValue={sneaker?.badge ?? ''} className={FIELD}>
            <option value="">Kein Badge</option>
            <option value="Bestseller">Bestseller</option>
            <option value="Neu">Neu</option>
            <option value="Trend">Trend</option>
            <option value="Luxus">Luxus</option>
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Affiliate-Link *</label>
        <input name="affiliate_url" type="url" required defaultValue={sneaker?.affiliate_url} className={FIELD} placeholder="https://www.awin1.com/..." />
      </div>

      <div>
        <label className={LABEL}>Bild-URL</label>
        <input name="image_url" type="url" defaultValue={sneaker?.image_url ?? ''} className={FIELD} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Style *</label>
          <select name="style" required defaultValue={sneaker?.style ?? 'lifestyle'} className={FIELD}>
            <option value="lifestyle">Lifestyle</option>
            <option value="sport">Sport</option>
            <option value="luxus">Luxus</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Quelle</label>
          <select name="source" defaultValue={sneaker?.source ?? 'manual'} className={FIELD}>
            <option value="manual">manual</option>
            <option value="awin">awin</option>
            <option value="amazon">amazon</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          id="active"
          defaultChecked={sneaker?.active ?? true}
          className="w-4 h-4 accent-[#1A1A1A]"
        />
        <label htmlFor="active" className="text-sm font-dm-sans">
          Aktiv (auf der Site sichtbar)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-[#1A1A1A] text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#333] transition-colors"
        >
          {isEdit ? 'Speichern' : 'Anlegen'}
        </button>
        <a
          href="/admin"
          className="border border-[#ddd] text-[#666] text-xs tracking-widest uppercase px-6 py-3 hover:border-[#1A1A1A] transition-colors"
        >
          Abbrechen
        </a>
      </div>
    </form>
  )
}
```

- [ ] **Step 13.3: Write `app/admin/neu/page.tsx`**

```tsx
import { createSneaker } from '../actions'
import SneakerForm from '@/components/admin/SneakerForm'

export default function NeuPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin" className="text-sm text-[#888] hover:text-[#1A1A1A] font-dm-sans">
          ← Zurück
        </a>
        <h1 className="font-playfair text-2xl font-bold">Neuer Sneaker</h1>
      </div>
      <SneakerForm action={createSneaker} />
    </div>
  )
}
```

- [ ] **Step 13.4: Write `app/admin/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import { updateSneaker } from '../actions'
import SneakerForm from '@/components/admin/SneakerForm'

async function getSneaker(id: string): Promise<Sneaker | null> {
  const supabase = createClient()
  const { data } = await supabase.from('sneakers').select('*').eq('id', id).single()
  return data
}

type Props = { params: { id: string } }

export default async function EditPage({ params }: Props) {
  const sneaker = await getSneaker(params.id)
  if (!sneaker) notFound()

  const boundAction = updateSneaker.bind(null, sneaker.id)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin" className="text-sm text-[#888] hover:text-[#1A1A1A] font-dm-sans">
          ← Zurück
        </a>
        <h1 className="font-playfair text-2xl font-bold">
          {sneaker.name} bearbeiten
        </h1>
      </div>
      <SneakerForm sneaker={sneaker} action={boundAction} />
    </div>
  )
}
```

- [ ] **Step 13.5: Verify full CRUD flow**

```bash
npm run dev
```

1. Go to http://localhost:3000/admin/neu → fill in form → click "Anlegen" → expect: redirect to `/admin`, new sneaker appears
2. Click "Bearbeiten" on a sneaker → change name → click "Speichern" → expect: updated in list
3. Click "Löschen" → confirm → expect: sneaker removed from list and from http://localhost:3000/sneaker

- [ ] **Step 13.6: Commit**

```bash
git add app/admin/ components/admin/
git commit -m "feat: add admin CRUD form with server actions for create/update/delete"
```

---

## Task 14: SEO — Robots, Sitemap, Metadata

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

- [ ] **Step 14.1: Write `app/robots.ts`**

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin',
      },
    ],
    sitemap: 'https://weissesneaker.de/sitemap.xml',
  }
}
```

- [ ] **Step 14.2: Write `app/sitemap.ts`**

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://weissesneaker.de'
  const now = new Date()

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/sneaker`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/pflege`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
```

- [ ] **Step 14.3: Add page-level metadata to `/sneaker` and `/pflege`**

Already done in Tasks 9 and 10 via the `export const metadata` declarations. Verify they are present:

- `app/sneaker/page.tsx` line 1: `export const metadata: Metadata = { title: 'Weiße Sneaker kaufen...' ... }`
- `app/pflege/page.tsx` line 1: `export const metadata: Metadata = { title: 'Weiße Sneaker reinigen...' ... }`

If missing, add them as shown in those tasks.

- [ ] **Step 14.4: Verify robots and sitemap**

```bash
npm run dev
```

- Open http://localhost:3000/robots.txt — expect: `Disallow: /admin`, sitemap URL
- Open http://localhost:3000/sitemap.xml — expect: XML with 3 URLs (/, /sneaker, /pflege)

- [ ] **Step 14.5: Run full test suite**

```bash
npm test
```

Expected: all tests pass (affiliates, AffiliateButton, FilterBar).

- [ ] **Step 14.6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 14.7: Build check**

```bash
npm run build
```

Expected: build succeeds with no errors. Note: ensure `.env.local` has valid Supabase credentials, or the build will fail on Supabase calls.

- [ ] **Step 14.8: Final commit**

```bash
git add -A
git commit -m "feat: add robots.txt, sitemap.xml, and verify full SEO setup"
```

---

## Done ✓

At this point the site has:
- ✅ Homepage with bold hero, sneaker strip, teaser sections
- ✅ `/sneaker` with server-side filtered grid (12 sneakers)
- ✅ `/pflege` with 6-section care guide and affiliate product cards
- ✅ Admin panel with login, sneaker list, create/edit/delete
- ✅ Supabase database with RLS
- ✅ AffiliateButton with tracking URL
- ✅ SEO: metadata, robots, sitemap, JSON-LD
- ✅ Tests for core utilities and client components
- ✅ Ready for `vercel deploy`

**Vercel Deploy:**
```bash
npm install -g vercel
vercel --prod
```

In Vercel Dashboard → Project → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
