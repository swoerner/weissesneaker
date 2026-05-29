# Newsletter-Signup mit Admin-Übersicht — Design Spec

**Datum:** 2026-05-29
**Status:** Approved
**Ziel:** Newsletter-Anmeldeformular auf der Homepage + Subscriber-Verwaltung im Admin-Panel

---

## 1. Datenbankschema

Neue Tabelle `newsletter_subscribers` in Supabase:

```sql
CREATE TABLE newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Nur eingeloggte Admins dürfen lesen/löschen
CREATE POLICY "Admin only" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'authenticated');

-- Jeder darf sich eintragen
CREATE POLICY "Public insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
```

---

## 2. Server Action

**Datei:** `app/actions/newsletter.ts`

- Separate Datei (nicht in `app/admin/actions.ts`), da die Action von einer öffentlichen Seite aufgerufen wird
- Validiert E-Mail-Format mit Zod
- Verwendet `createClient()` (anon key) — die public INSERT-Policy erlaubt das
- Gibt `{ error?: string, success?: boolean }` zurück
- Bei UNIQUE-Constraint-Verletzung: Fehlertext „Diese E-Mail ist bereits registriert."

---

## 3. Homepage-Section

**Datei:** `components/NewsletterForm.tsx` (Client Component)

- `'use client'` — benötigt `useFormState` für inline Feedback
- Formular: E-Mail-Feld + „Anmelden"-Button
- Erfolgsstate: „Danke! Du bist jetzt dabei." (Formular wird ausgeblendet)
- Fehlerstate: Fehlermeldung unter dem Feld
- Design: schwarz/beige/weiß, konsistent mit bestehendem Stil

**Datei:** `app/page.tsx`

- Import von `<NewsletterForm>` — bleibt selbst ein Server Component
- Platzierung: zwischen Pflege-Teaser und dem abschließenden JSON-LD-Block

---

## 4. Admin-Seite `/admin/newsletter`

**Datei:** `app/admin/(protected)/newsletter/page.tsx` (Server Component)

- Liest alle Subscriber via Supabase, sortiert nach `created_at DESC`
- Headline: „{n} Abonnenten"
- Tabelle: E-Mail | Datum der Anmeldung
- Datum-Format: `de-DE` Locale
- CSV-Export als Client Component `<NewsletterExport>` — bekommt die Daten als Props, generiert Blob client-side

**Datei:** `components/admin/NewsletterExport.tsx` (Client Component)

- Button „CSV exportieren"
- Generiert `email,created_at\n...` als Blob
- Löst Download aus via `<a>` mit `href=URL.createObjectURL(...)`

---

## 5. Admin-Navigation

**Datei:** `app/admin/(protected)/layout.tsx`

- Neuer Link „Newsletter" → `/admin/newsletter` in der bestehenden Admin-Nav-Leiste

---

## 6. Dateien

| Datei | Aktion |
|---|---|
| `app/actions/newsletter.ts` | Neu — Server Action |
| `components/NewsletterForm.tsx` | Neu — Client Component |
| `components/admin/NewsletterExport.tsx` | Neu — Client Component |
| `app/page.tsx` | Erweitert — Newsletter-Section hinzufügen |
| `app/admin/(protected)/newsletter/page.tsx` | Neu — Admin-Seite |
| `app/admin/(protected)/layout.tsx` | Erweitert — Nav-Link hinzufügen |
