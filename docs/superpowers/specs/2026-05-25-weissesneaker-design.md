# weissesneaker.de — Design Spec

**Datum:** 2026-05-25  
**Status:** Approved  
**Ziel:** Affiliate-Website für weiße Sneaker mit Produktübersicht, Pflegehinweisen und Admin-Panel

---

## 1. Projektziel

Moderne Affiliate-Website für weissesneaker.de. Die Seite zeigt kuratierte weiße Sneaker 2025, bietet Pflegehinweise und leitet Nutzer über Affiliate-Links zu Shops weiter (Provision pro Purchase). Sneaker-Daten kommen aus Supabase — manuell gepflegt und über externe Quellen (z.B. Awin) importiert.

---

## 2. Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS |
| Fonts | Playfair Display + DM Sans (via `next/font/google`) |
| Datenbank | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email/Passwort, nur Admin) |
| Deployment | Vercel |

---

## 3. Architektur

**Strategie:** Server Components + Supabase direkt (kein API-Layer).

- Öffentliche Seiten: Next.js Server Components fragen Supabase direkt über `@supabase/ssr` ab — kein Client-JS für Datenabruf.
- Filter auf `/sneaker`: URL-Parameter (`?brand=nike&style=lifestyle`) → serverseitig gefilterte Supabase-Query.
- Admin-Panel: Nach Speichern `revalidatePath('/')` + `revalidatePath('/sneaker')` → öffentliche Seiten sofort aktuell.
- Affiliate-Tracking: `?ref=weissesneaker` wird clientseitig via `<AffiliateButton>` angehängt.

---

## 4. Datenbankschema

### Tabelle: `sneakers`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | uuid | Primary Key (auto) |
| `name` | text | z.B. „Air Force 1" |
| `brand` | text | z.B. „Nike" |
| `slug` | text (unique) | z.B. „nike-air-force-1" |
| `description` | text | 2 Sätze Kurzbeschreibung |
| `price_min` | integer | Preis in Cent (z.B. 11000 = 110 €) |
| `image_url` | text | Produkt-Bild-URL |
| `affiliate_url` | text | Affiliate-Link (Awin etc.) |
| `badge` | text | „Bestseller", „Neu", „Trend", „Luxus" |
| `style` | text | „lifestyle", „sport", „luxus" |
| `source` | text | „manual", „awin", „amazon" etc. |
| `active` | boolean | Sichtbar auf der Site? |
| `created_at` | timestamptz | Auto |

**RLS:** Öffentlich lesbar (SELECT) ohne Auth. INSERT/UPDATE/DELETE nur mit Service Role Key.

---

## 5. Seitenstruktur

### 5.1 `/` — Homepage

**Hero:** Bold Full-Width — dunkles texturiertes Banner über volle Breite, Headline „Die besten weißen Sneaker 2025", zwei CTAs: „Alle Sneaker" + „Top Picks".

**Sneaker-Streifen:** Horizontal scrollende Reihe der Top-Sneaker (gefiltert: `active = true`, sortiert nach `created_at DESC`, max 8). Hochformat-Karte mit Badge.

**Teaser-Sektionen:**
- „Warum weiße Sneaker?" — kurzer Copytext
- Pflege-Teaser mit Link zu `/pflege`

**Newsletter-Signup:** Statisch (kein Backend), optisches Element.

### 5.2 `/sneaker` — Übersicht

**Filter-Bar:** Brand (Dropdown), Preisspanne (Buttons: alle / unter 100 € / 100–200 € / über 200 €), Style (Lifestyle / Sport / Luxus). Filter als URL-Parameter → serverseitig.

**Grid:** 3 Spalten (Desktop), 2 Spalten (Tablet), 1 Spalte (Mobile). Mind. 12 Sneaker-Karten.

**Sneaker-Karte (Design A — Hochformat/Klassisch):**
- Badge oben links (schwarz/beige)
- Produktbild (hellgrauer Hintergrund)
- Brand (klein, grau) + Name (fett)
- Beschreibung (2 Sätze, grau)
- Preis + `<AffiliateButton>` in einer Zeile
- Hover: `scale(1.02)` + `shadow-lg` via Tailwind `transition`

### 5.3 `/pflege` — Pflegehinweise

Strukturierte Guide-Seite mit 6 Abschnitten:
1. Grundreinigung (Materialien, Schritte)
2. Tiefenreinigung für Hartnäckiges
3. Pflege nach Material (Leder, Canvas, Mesh, Wildleder)
4. Weißmachen & Aufhellen
5. Lagerung & Prävention
6. Produktempfehlungen (Pflegeprodukte als Affiliate-Links)

Statischer Inhalt — kein Datenbankbedarf.

### 5.4 `/admin` — Admin-Panel (geschützt)

**Auth-Guard:** `admin/layout.tsx` prüft Supabase-Session via Middleware-Cookie. Redirect zu `/admin/login` wenn nicht eingeloggt.

**`/admin` — Liste:**
- Tabelle: Name, Brand, Preis, Status (Aktiv/Inaktiv), Aktionen (Bearbeiten / Löschen)
- Suchfeld (clientseitig)
- „+ Neuer Sneaker"-Button

**`/admin/neu` + `/admin/[id]` — Formular:**
- Felder: Name*, Brand*, Preis*, Beschreibung*, Affiliate-Link*, Bild-URL, Badge (Dropdown), Style (Dropdown), Quelle (Dropdown), Aktiv (Checkbox)
- Validation: React Hook Form + Zod
- Nach Speichern: `revalidatePath()` → zurück zur Liste

---

## 6. Komponenten

| Komponente | Typ | Beschreibung |
|---|---|---|
| `<Navigation>` | Server | Sticky Header, Logo links, Links rechts, Mobile Hamburger |
| `<Footer>` | Server | Affiliate-Disclaimer + Copyright |
| `<SneakerCard>` | Server | Hochformat-Karte (Design A) |
| `<AffiliateButton>` | Client | CTA-Button, `target="_blank"`, `rel="noopener noreferrer sponsored"`, hängt `?ref=weissesneaker` an |
| `<FilterBar>` | Client | Brand/Preis/Style-Filter via `useSearchParams` + `router.replace()` |

---

## 7. Design-System

**Farben:**
```
Background:  #FAFAFA
Akzent:      #1A1A1A
Highlight:   #E8E0D5
CTA-Button:  #1A1A1A (Text: #FFFFFF)
```

**Fonts:**
- Headlines: Playfair Display (serif)
- Body/UI: DM Sans (sans-serif)

**Prinzipien:** Viel Whitespace, subtile Hover-Animationen, Mobile-first, vollständig responsive.

---

## 8. Affiliate-Logik

**Disclaimer (Footer):**
> „Diese Seite enthält Affiliate-Links. Bei einem Kauf über diese Links erhalten wir eine kleine Provision – für dich entstehen keine Mehrkosten."

**`config/affiliates.ts`:** Fallback-Links und Tracking-Konfiguration. Haupt-Links liegen in der Supabase-Datenbank (`affiliate_url`).

**Tracking:** `<AffiliateButton>` hängt `?ref=weissesneaker` an alle Affiliate-URLs an. Links öffnen in neuem Tab.

---

## 9. SEO

| Seite | Title | Description |
|---|---|---|
| `/` | Die besten weißen Sneaker 2025 \| weissesneaker.de | Unsere Top-Picks für weiße Sneaker 2025 – kuratiert, unabhängig, ehrlich. |
| `/sneaker` | Weiße Sneaker kaufen – Top 12 Empfehlungen 2025 | Die schönsten weißen Sneaker im Vergleich: Nike, Adidas, Veja und mehr. |
| `/pflege` | Weiße Sneaker reinigen & pflegen – Die ultimative Anleitung | Schritt-für-Schritt-Anleitungen für saubere, strahlend weiße Sneaker. |
| `/admin` | noindex, nofollow | — |

- **robots.ts** — `/admin` blockiert
- **sitemap.ts** — dynamisch, alle 3 öffentlichen Seiten
- **JSON-LD** — `Product`-Schema auf Homepage und `/sneaker`
- **Alt-Texte** — `${name} von ${brand} – weißer Sneaker`

---

## 10. Dateistruktur

```
weissesneaker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── sneaker/
│   │   └── page.tsx
│   ├── pflege/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx        ← Auth-Guard
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── neu/page.tsx
│   │   └── [id]/page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── AffiliateButton.tsx
│   ├── SneakerCard.tsx
│   ├── FilterBar.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── types.ts
├── config/
│   └── affiliates.ts
├── public/
│   └── og-image.png
├── .env.local
└── next.config.ts
```

---

## 11. Deployment

- **Platform:** Vercel (automatische Next.js-Erkennung)
- **Env-Variablen:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (nur serverseitig, für Admin-Schreibzugriff)
- **Supabase RLS:** Öffentlich SELECT erlaubt, INSERT/UPDATE/DELETE nur mit Service Role Key

---

## 12. Out of Scope

- Bild-Upload (URLs werden manuell eingegeben)
- Kommentare / User-Accounts
- Newsletter-Backend
- Mehrsprachigkeit
- Produktseiten (`/sneaker/[slug]`) — vorerst kein Detailview
