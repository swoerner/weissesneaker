# Newsletter Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public newsletter signup form to the homepage and a subscriber management page in the admin panel, backed by a Supabase `newsletter_subscribers` table.

**Architecture:** A server action in `app/actions/newsletter.ts` handles public INSERT (anon key, public RLS policy). The homepage stays a Server Component — the form is extracted into `<NewsletterForm>` (Client Component using `useFormState`). The admin subscriber list is a Server Component that reads via the authenticated session. CSV export runs entirely client-side.

**Tech Stack:** Next.js 14 App Router, Supabase (anon key for public subscribe, session cookie for admin read), `useFormState` from `react-dom`, Zod for email validation, `@testing-library/react` + `userEvent` for component tests.

---

## Database Setup (manual — run in Supabase SQL Editor)

Run this SQL in your Supabase Dashboard → SQL Editor before starting implementation:

```sql
CREATE TABLE newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
```

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/actions/newsletter.ts` | Create | `subscribeNewsletter` server action |
| `components/NewsletterForm.tsx` | Create | Client Component — form + inline feedback |
| `components/admin/NewsletterExport.tsx` | Create | Client Component — CSV download button |
| `app/page.tsx` | Modify | Add `<NewsletterForm>` section |
| `app/admin/(protected)/newsletter/page.tsx` | Create | Admin subscriber list |
| `app/admin/(protected)/layout.tsx` | Modify | Add Newsletter nav link |
| `__tests__/NewsletterForm.test.tsx` | Create | Component tests |
| `__tests__/NewsletterExport.test.tsx` | Create | Component tests |

---

### Task 1: Server Action

**Files:**
- Create: `app/actions/newsletter.ts`

- [ ] **Step 1: Create the server action**

```typescript
// app/actions/newsletter.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const EmailSchema = z.object({
  email: z.string().email('Keine gültige E-Mail-Adresse'),
})

export type NewsletterState = {
  error?: string
  success?: boolean
}

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = EmailSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: parsed.data.email })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Diese E-Mail ist bereits registriert.' }
    }
    return { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' }
  }

  return { success: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/actions/newsletter.ts
git commit -m "feat: add newsletter subscribe server action"
```

---

### Task 2: NewsletterForm Component + Tests

**Files:**
- Create: `components/NewsletterForm.tsx`
- Create: `__tests__/NewsletterForm.test.tsx`

- [ ] **Step 1: Write the failing tests**

`useFormState` doesn't invoke actions in jsdom — mock it directly to control state:

```typescript
// __tests__/NewsletterForm.test.tsx
import { render, screen } from '@testing-library/react'
import { useFormState, useFormStatus } from 'react-dom'
import NewsletterForm from '@/components/NewsletterForm'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(),
  useFormStatus: jest.fn(),
}))

const mockUseFormState = useFormState as jest.Mock
const mockUseFormStatus = useFormStatus as jest.Mock

describe('NewsletterForm', () => {
  beforeEach(() => {
    mockUseFormStatus.mockReturnValue({ pending: false })
  })

  it('renders email input and submit button', () => {
    mockUseFormState.mockReturnValue([{}, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByPlaceholderText('deine@email.de')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument()
  })

  it('shows success message when state.success is true', () => {
    mockUseFormState.mockReturnValue([{ success: true }, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByText('Danke! Du bist jetzt dabei.')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('deine@email.de')).not.toBeInTheDocument()
  })

  it('shows error message from state.error', () => {
    mockUseFormState.mockReturnValue([{ error: 'Diese E-Mail ist bereits registriert.' }, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByText('Diese E-Mail ist bereits registriert.')).toBeInTheDocument()
  })

  it('shows pending state on submit button while loading', () => {
    mockUseFormState.mockReturnValue([{}, jest.fn()])
    mockUseFormStatus.mockReturnValue({ pending: true })
    render(<NewsletterForm />)
    expect(screen.getByRole('button', { name: /wird angemeldet/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=NewsletterForm --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/NewsletterForm'`

- [ ] **Step 3: Create the component**

```typescript
// components/NewsletterForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { subscribeNewsletter, type NewsletterState } from '@/app/actions/newsletter'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-dm-sans text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? 'Wird angemeldet...' : 'Anmelden'}
    </button>
  )
}

const initialState: NewsletterState = {}

export default function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeNewsletter, initialState)

  if (state.success) {
    return (
      <p className="font-dm-sans text-sm text-[#1A1A1A] font-medium">
        Danke! Du bist jetzt dabei.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="email"
          name="email"
          required
          placeholder="deine@email.de"
          className="w-full border border-[#ddd] px-3 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] font-dm-sans"
        />
        {state.error && (
          <p className="text-xs text-red-600 mt-1 font-dm-sans">{state.error}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=NewsletterForm --no-coverage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add components/NewsletterForm.tsx __tests__/NewsletterForm.test.tsx
git commit -m "feat: add NewsletterForm client component"
```

---

### Task 3: Add Newsletter Section to Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the newsletter section**

In `app/page.tsx`, add the import at the top with the other component imports:

```typescript
import NewsletterForm from '@/components/NewsletterForm'
```

Then insert this section between the Pflege-Teaser section and the JSON-LD script tag:

```tsx
{/* Newsletter */}
<section className="bg-[#1A1A1A]">
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <p className="font-dm-sans text-[10px] tracking-widest uppercase text-[#E8E0D5] mb-3">
      Newsletter
    </p>
    <h2 className="font-playfair text-3xl font-bold text-white mb-4">
      Immer up to date
    </h2>
    <p className="font-dm-sans text-sm text-[#888] mb-8">
      Neue Sneaker, exklusive Deals und Pflege-Tipps — direkt in dein Postfach.
    </p>
    <div className="max-w-md mx-auto">
      <NewsletterForm />
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify the page compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors for `app/page.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add newsletter signup section to homepage"
```

---

### Task 4: Admin Newsletter Page + CSV Export

**Files:**
- Create: `components/admin/NewsletterExport.tsx`
- Create: `app/admin/(protected)/newsletter/page.tsx`
- Create: `__tests__/NewsletterExport.test.tsx`

- [ ] **Step 1: Write the failing test for NewsletterExport**

```typescript
// __tests__/NewsletterExport.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsletterExport from '@/components/admin/NewsletterExport'

describe('NewsletterExport', () => {
  const subscribers = [
    { email: 'a@example.com', created_at: '2026-05-29T10:00:00Z' },
    { email: 'b@example.com', created_at: '2026-05-28T09:00:00Z' },
  ]

  it('renders export button', () => {
    render(<NewsletterExport subscribers={subscribers} />)
    expect(screen.getByRole('button', { name: /csv exportieren/i })).toBeInTheDocument()
  })

  it('triggers a download on click', async () => {
    const createObjectURL = jest.fn(() => 'blob:mock')
    const revokeObjectURL = jest.fn()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<NewsletterExport subscribers={subscribers} />)
    await userEvent.click(screen.getByRole('button', { name: /csv exportieren/i }))

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    clickSpy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=NewsletterExport --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/admin/NewsletterExport'`

- [ ] **Step 3: Create the NewsletterExport component**

```typescript
// components/admin/NewsletterExport.tsx
'use client'

type Subscriber = { email: string; created_at: string }

export default function NewsletterExport({ subscribers }: { subscribers: Subscriber[] }) {
  function handleExport() {
    const rows = [
      'email,created_at',
      ...subscribers.map((s) => `${s.email},${s.created_at}`),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="font-dm-sans text-xs tracking-widest uppercase px-5 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
    >
      CSV exportieren
    </button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=NewsletterExport --no-coverage
```

Expected: PASS (2 tests)

- [ ] **Step 5: Create the admin newsletter page**

```typescript
// app/admin/(protected)/newsletter/page.tsx
import { createClient } from '@/lib/supabase/server'
import NewsletterExport from '@/components/admin/NewsletterExport'

type Subscriber = { id: string; email: string; created_at: string }

async function getSubscribers(): Promise<Subscriber[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return data ?? []
}

export default async function NewsletterAdminPage() {
  const subscribers = await getSubscribers()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold">
          {subscribers.length} Abonnenten
        </h1>
        <NewsletterExport subscribers={subscribers} />
      </div>

      <div className="bg-white border border-[#eee] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 bg-[#F5F5F5] text-[10px] font-dm-sans tracking-widest uppercase text-[#888]">
          <div>E-Mail</div>
          <div>Angemeldet am</div>
        </div>

        {subscribers.length === 0 && (
          <div className="px-4 py-8 text-center text-[#888] font-dm-sans text-sm">
            Noch keine Abonnenten.
          </div>
        )}

        {subscribers.map((subscriber) => (
          <div
            key={subscriber.id}
            className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-t border-[#f0f0f0] items-center"
          >
            <div className="font-dm-sans text-sm">{subscriber.email}</div>
            <div className="font-dm-sans text-sm text-[#666]">
              {new Date(subscriber.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/NewsletterExport.tsx app/admin/(protected)/newsletter/page.tsx __tests__/NewsletterExport.test.tsx
git commit -m "feat: add admin newsletter subscriber list with CSV export"
```

---

### Task 5: Admin Navigation Link

**Files:**
- Modify: `app/admin/(protected)/layout.tsx`

- [ ] **Step 1: Add the Newsletter link to admin nav**

In `app/admin/(protected)/layout.tsx`, find the nav links block:

```tsx
<a
  href="/admin"
  className="text-xs text-[#888] hover:text-white transition-colors"
>
  Sneaker
</a>
```

Replace with:

```tsx
<a
  href="/admin"
  className="text-xs text-[#888] hover:text-white transition-colors"
>
  Sneaker
</a>
<a
  href="/admin/newsletter"
  className="text-xs text-[#888] hover:text-white transition-colors"
>
  Newsletter
</a>
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests pass

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes with no errors

- [ ] **Step 4: Commit**

```bash
git add app/admin/(protected)/layout.tsx
git commit -m "feat: add Newsletter link to admin navigation"
```

---

### Task 6: Push

- [ ] **Step 1: Push all commits**

```bash
git push
```

Expected: all 5 commits pushed to `origin/master`
