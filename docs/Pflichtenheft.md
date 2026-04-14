# Pflichtenheft: Karlsruhe Events App

**Version:** 1.0-draft  
**Datum:** 2026-04-13  
**Status:** In Erstellung  
**Autor:** Fabian (cheetahIX) + J.A.R.V.I.S.

---

## 1. Einleitung

### 1.1 Zweck dieses Dokuments
Dieses Pflichtenheft beschreibt die **technische Umsetzung** der Karlsruhe Events App. Es basiert auf dem [Lastenheft](../../1_Ideen-Sammlung/Karlsruhe-Events-App/Lastenheft.md) und definiert konkret **wie** die Anforderungen umgesetzt werden.

### 1.2 Gültigkeitsbereich
- **Produkt:** Karlsruhe Events App (MVP)
- **Zeitraum:** Launch bis erste Nutzer-Feedback-Iteration
- **Erweiterungen:** Werden in separaten Pflichtenheften dokumentiert

---

## 2. Systemübersicht

### 2.1 Systemarchitektur (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │  Mobile     │  │  Instagram (Ref)   │  │
│  │   (User)    │  │  (Responsive)│  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│              Next.js 15 (App Router)                        │
│         React Server Components + Client Components         │
│                   Tailwind CSS v4                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       API                                   │
│              Next.js API Routes                             │
│         RESTful API + Server Actions                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                │
│              PostgreSQL (Supabase)                          │
│                    ORM: Prisma                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   FILE STORAGE                              │
│           Supabase Storage (Event-Bilder)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technologie-Stack (final)

| Ebene | Technologie | Begründung |
|-------|-------------|------------|
| **Framework** | Next.js 15 (App Router) | Full-stack, React, moderne Patterns |
| **Styling** | Tailwind CSS v4 | Utility-first, schnelle Entwicklung |
| **UI-Komponenten** | shadcn/ui + Radix | Accessible, anpassbar, keine Lock-in |
| **Database** | PostgreSQL (Supabase) | Managed, Auth built-in, Skalierbar |
| **ORM** | Prisma | Type-safe, Migrationen, gute DX |
| **Auth (später)** | Supabase Auth | Einfache Integration, Passkey-ready |
| **Hosting** | Vercel | Optimized for Next.js, Preview Deployments |
| **Images** | Supabase Storage / Cloudinary | Kosteneffizient, CDN |
| **Monitoring** | Vercel Analytics + Logs | Eingebaut, einfach |

### 2.3 Nicht verwendet (bewusste Entscheidung)

| Alternative | Grund der Ablehnung |
|-------------|---------------------|
| Firebase | Vendor Lock-in, schlechtere DX für komplexe Queries |
| Strapi/CMS | Zu schwer für MVP, Overhead |
| Native App | Zu teuer, zu langsam für MVP-Validierung |
| tRPC | Zu komplex für einfaches CRUD, REST reicht |

---

## 3. Datenmodell

### 3.1 Entitäten

```prisma
// schema.prisma

model Event {
  id              String   @id @default(uuid())
  title           String
  description     String   @db.Text
  dateStart       DateTime
  dateEnd         DateTime?
  locationName    String
  locationAddress String?
  latitude        Float?
  longitude       Float?
  
  category        Category
  imageUrl        String?
  sourceUrl       String?
  isFeatured      Boolean  @default(false)
  status          Status   @default(DRAFT)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([dateStart])
  @@index([category])
  @@index([status])
}

enum Category {
  MUSIC
  CULTURE
  PARTY
  FLEAMARKET
  UNI
  SPORT
  OTHER
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 3.2 Erweiterungen (Post-MVP)

- `User` (für Accounts)
- `EventSubmission` (für User-Submission)
- `Favorite` (für Merkliste)
- `Tag` (für feinere Kategorisierung)

---

## 4. API-Spezifikation

### 4.1 Endpunkte (REST)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/events` | Alle Events (mit Query-Parametern für Filter) |
| GET | `/api/events/:id` | Einzelnes Event |
| POST | `/api/events` | Event erstellen (Admin) |
| PUT | `/api/events/:id` | Event aktualisieren (Admin) |
| DELETE | `/api/events/:id` | Event archivieren (Admin) |

### 4.2 Query-Parameter (GET /api/events)

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `category` | Category | Filter nach Kategorie |
| `date` | Enum: today, tomorrow, week, weekend | Zeitfenster |
| `search` | String | Volltext-Suche (Titel, Beschreibung) |
| `featured` | Boolean | Nur featured Events |
| `page` | Number | Pagination |
| `limit` | Number | Ergebnisse pro Seite (default: 20) |

### 4.3 Response-Format

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "String",
      "description": "String",
      "dateStart": "ISO-8601",
      "dateEnd": "ISO-8601 | null",
      "locationName": "String",
      "locationAddress": "String | null",
      "category": "Category",
      "imageUrl": "String | null",
      "isFeatured": Boolean
    }
  ],
  "meta": {
    "total": Number,
    "page": Number,
    "limit": Number,
    "hasMore": Boolean
  }
}
```

---

## 5. Frontend-Architektur

### 5.1 Seitenstruktur

| Route | Zweck | Data Fetching |
|-------|-------|---------------|
| `/` | Landing + Event-Liste | SSR mit Filter-State |
| `/event/[id]` | Event-Detail | SSR |
| `/admin` | Admin-Dashboard | CSR (geschützt) |
| `/admin/events/new` | Event erstellen | CSR |
| `/admin/events/[id]/edit` | Event bearbeiten | SSR + CSR |

### 5.2 Komponenten-Hierarchie (vereinfacht)

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Landing / Event-Liste
├── event/
│   └── [id]/
│       └── page.tsx        # Event-Detail
├── admin/
│   ├── layout.tsx          # Admin-Layout
│   ├── page.tsx            # Admin-Dashboard
│   └── events/
│       ├── new/
│       │   └── page.tsx    # Event erstellen
│       └── [id]/
│           └── edit/
│               └── page.tsx # Event bearbeiten
└── api/                    # API Routes

components/
├── events/
│   ├── EventCard.tsx       # Event-Preview
│   ├── EventList.tsx       # Liste + Filter
│   ├── EventDetail.tsx     # Volle Event-Ansicht
│   └── EventFilters.tsx    # Filter-UI
├── admin/
│   ├── EventForm.tsx       # Create/Edit Form
│   ├── EventTable.tsx      # Admin-Übersicht
│   └── ImageUpload.tsx     # Bild-Upload
└── ui/                     # shadcn Komponenten
```

### 5.3 State Management

- **Server State:** React Server Components + Next.js Data Fetching
- **Client State:** React useState (lokal) für UI-State
- **Kein Global State:** Zu einfach für Redux/Zustand, Props reichen

---

## 6. Admin-Panel Spezifikation

### 6.1 Funktionen

| Feature | Beschreibung |
|---------|--------------|
| Event-Übersicht | Tabelle mit allen Events, Sortierung, Pagination |
| Event erstellen | Formular mit allen Feldern, Bild-Upload |
| Event bearbeiten | Bestehende Events aktualisieren |
| Event archivieren | Soft-Delete (Status auf ARCHIVED) |
| Dashboard | Stats: Events heute, diese Woche, Views (später) |

### 6.2 Auth (Phase 2 / Post-MVP)

- Einfache HTTP-Basic Auth für MVP (`.htaccess` oder Middleware)
- Später: Supabase Auth mit Rollen (Admin, Editor)

---

## 7. Deployment & Hosting

### 7.1 Vercel-Setup

| Aspekt | Konfiguration |
|--------|---------------|
| **Projekt** | GitHub-Integration |
| **Environment** | Production + Preview (per PR) |
| **Build Command** | `next build` |
| **Output Directory** | `.next` |
| **Node Version** | 20.x |

### 7.2 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Für Prisma Migrate

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Admin (MVP)
ADMIN_USERNAME="..."
ADMIN_PASSWORD="..."  # Gehasht
```

### 7.3 Domain

- **Vorschlag:** `karlsruhe-events.de` oder `events-ka.de`
- **Alternative:** Subdomain unter bestehender Domain

---

## 8. Entwicklungs-Workflow

### 8.1 Lokale Entwicklung

```bash
# Setup
git clone [repo-url]
cd karlsruhe-events
cp .env.example .env.local
npm install

# Database
npx prisma migrate dev
npx prisma db seed  # Optional: Testdaten

# Dev-Server
npm run dev         # localhost:3000
```

### 8.2 Git-Workflow

- **main:** Production-ready
- **develop:** Integration
- **feature/*:** Feature-Branches
- **PRs:** Required Review, Preview Deployment

### 8.3 Datenbank-Migrationen

```bash
# Neue Migration erstellen
npx prisma migrate dev --name [beschreibung]

# Production deploy
npx prisma migrate deploy
```

---

## 9. Qualitätssicherung

### 9.1 Testing (MVP-Light)

| Typ | Umfang | Tools |
|-----|--------|-------|
| Unit Tests | Kritische Utils | Vitest |
| Integration | API Routes | Vitest + MSW |
| E2E | Happy Paths | Playwright (optional) |

### 9.2 Code-Quality

- **TypeScript:** Strict Mode
- **ESLint:** Next.js Config
- **Prettier:** Auto-format
- **Husky:** Pre-commit hooks (optional)

### 9.3 Performance-Ziele

| Metrik | Ziel |
|--------|------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |

---

## 10. Sicherheit

| Aspekt | Maßnahme |
|--------|----------|
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React (escaped by default), CSP |
| CSRF | Next.js built-in protection |
| Auth | HTTP-Basic (MVP), später Passkeys |
| HTTPS | Vercel default |
| Secrets | Environment variables, nie committed |

---

## 11. Nicht-funktionale Anforderungen (Umsetzung)

| Anforderung | Umsetzung |
|-------------|-----------|
| Ladezeit < 2s | SSR, Image-Optimierung, CDN |
| SEO | Next.js Metadata API, Sitemap, robots.txt |
| Responsive | Mobile-first Tailwind |
| Barrierefreiheit | shadcn/ui (Radix), ARIA-Labels |
| DSGVO | Datenschutzerklärung, keine Tracking (MVP) |

---

## 12. Risiken & Mitigation (technisch)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Supabase Free Tier Limits | Mittel | Mittel | Monitoring, Upgrade-Pfad |
| Bild-Hosting Kosten | Niedrig | Mittel | Optimierung, Limits |
| Next.js Breaking Changes | Niedrig | Hoch | Pin Version, regelmäßige Updates |
| Performance bei vielen Events | Niedrig | Mittel | Pagination, Caching |

---

## 13. Nächste Schritte (Sprint 0)

1. [ ] Repository auf GitHub anlegen
2. [ ] Next.js-Projekt initialisieren
3. [ ] Supabase-Projekt erstellen
4. [ ] Prisma-Schema deployen
5. [ ] Ersten Event anlegen (manuell)
6. [ ] Event-Liste implementieren
7. [ ] Admin-Panel bauen
8. [ ] Deployen auf Vercel

---

## 14. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |
| RSC | React Server Components |
| ORM | Object-Relational Mapping |
| DX | Developer Experience |
| CSP | Content Security Policy |

---

## Anhang

### A. Wireframes (kommt)
- Event-Liste
- Event-Detail
- Admin-Panel

### B. API-Dokumentation (kommt)
- Postman Collection
- OpenAPI/Swagger (optional)

### C. Deployment-Checkliste (kommt)
- Pre-Launch
- Launch-Day
- Post-Launch

---

*Letzte Aktualisierung: 2026-04-13*
