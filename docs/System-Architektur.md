# System-Architektur: Karlsruhe Events App

**Version:** 1.0-draft  
**Datum:** 2026-04-13

---

## 1. System-Kontext-Diagramm (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXTERNE SYSTEME                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │  Nutzer  │  │ Instagram│  │ Event-   │  │   Google       │   │
│  │(Browser) │  │  (Ref)   │  │ Quellen │  │   (SEO)        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘   │
│       │             │             │                │            │
└───────┼─────────────┼─────────────┼────────────────┼────────────┘
        │             │             │                │
        ▼             │             │                │
┌─────────────────────────────────────────────────────────────────┐
│                   KARLSRUHE EVENTS APP                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS APPLICATION                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │   Frontend   │  │    API       │  │  Admin-Panel   │  │  │
│  │  │   (Pages)    │  │  (Routes)    │  │                │  │  │
│  │  └──────────────┘  └──────┬───────┘  └────────────────┘  │  │
│  │                           │                              │  │
│  └───────────────────────────┼──────────────────────────────┘  │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNE SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Supabase    │  │   Vercel     │  │  Cloudinary        │    │
│  │  (Postgres)  │  │   (Hosting)  │  │  (Images, opt.)    │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Container-Diagramm (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WEB BROWSER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │   React     │  │   Tailwind  │  │   Client State          │   │  │
│  │  │ Components  │  │   Styles    │  │   (useState)            │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │              NEXT.JS APP (App Router)                    │   │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │  │
│  │  │  │    RSC      │  │   Client    │  │    API Routes   │  │   │  │
│  │  │  │  (Pages)    │  │ Components  │  │   (REST)        │  │   │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │  │
│  │  │                                                         │   │  │
│  │  │  ┌─────────────────────────────────────────────────┐    │   │  │
│  │  │  │              Prisma ORM                        │    │   │  │
│  │  │  └─────────────────────────────────────────────────┘    │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL / HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                        │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐   │
│  │      PostgreSQL          │  │         Storage                    │   │
│  │  ┌────────────────────┐  │  │  ┌────────────────────────────┐   │   │
│  │  │   events table     │  │  │  │   event-images bucket    │   │   │
│  │  │   ├ id             │  │  │  └────────────────────────────┘   │   │
│  │  │   ├ title          │  │  │                                  │   │
│  │  │   ├ description    │  │  └──────────────────────────────────┘   │
│  │  │   ├ dateStart      │  │                                         │
│  │  │   ├ category       │  │                                         │
│  │  │   └ ...            │  │                                         │
│  │  └────────────────────┘  │                                         │
│  └──────────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Komponenten-Diagramm (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP STRUCTURE                           │
│                                                                      │
│  app/                                                                │
│  ├── layout.tsx              [RootLayout]                           │
│  │      ├── Providers                                        │
│  │      └── Navigation                                       │
│  │                                                              │
│  ├── page.tsx                [HomePage]                             │
│  │      ├── EventFilters      [Client]                       │
│  │      └── EventList         [Server → Client]              │
│  │            └── EventCard[]                                 │
│  │                                                              │
│  ├── event/[id]/                                                    │
│  │   └── page.tsx             [EventDetailPage]              │
│  │         └── EventDetail    [Server]                        │
│  │                                                              │
│  ├── admin/                                                         │
│  │   ├── layout.tsx           [AdminLayout]                 │
│  │   ├── page.tsx              [AdminDashboard]             │
│  │   └── events/                                                   │
│  │       ├── new/                                                   │
│  │       │   └── page.tsx      [CreateEventPage]            │
│  │       │         └── EventForm    [Client]               │
│  │       └── [id]/edit/                                             │
│  │           └── page.tsx      [EditEventPage]              │
│  │                 └── EventForm    [Client]                 │
│  │                                                              │
│  └── api/events/                                                    │
│      └── route.ts              [API Handler]                  │
│                                                                      │
│  components/                                                         │
│  ├── events/                                                        │
│  │   ├── EventCard.tsx                                              │
│  │   ├── EventList.tsx                                               │
│  │   ├── EventDetail.tsx                                             │
│  │   └── EventFilters.tsx                                            │
│  │                                                              │
│  ├── admin/                                                         │
│  │   ├── EventForm.tsx                                              │
│  │   ├── EventTable.tsx                                              │
│  │   └── ImageUpload.tsx                                             │
│  │                                                              │
│  └── ui/                      [shadcn components]           │
│      ├── Button.tsx                                                  │
│      ├── Input.tsx                                                   │
│      ├── Select.tsx                                                  │
│      └── ...                                                         │
│                                                                      │
│  lib/                                                                │
│  ├── db.ts                    [Prisma Client]               │
│  ├── utils.ts                 [Helpers]                     │
│  └── api.ts                   [API Functions]               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Datenfluss (Event-Anzeige)

```
┌─────────┐     ┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│  User   │────▶│  Browser        │────▶│  Next.js     │────▶│   Prisma   │
│         │     │  (Request)      │     │  (RSC)       │     │            │
└─────────┘     └─────────────────┘     └──────────────┘     └────────────┘
                                                 │                 │
                                                 │                 │
                                                 ▼                 ▼
                                        ┌──────────────┐     ┌────────────┐
                                        │   SQL Query  │◀────│  Supabase  │
                                        │   (filtered) │     │  Postgres  │
                                        └──────────────┘     └────────────┘
                                                 │
                                                 ▼
┌─────────┐     ┌─────────────────┐     ┌──────────────┐
│  User   │◀────│  Browser        │◀────│  Next.js     │
│         │     │  (HTML + Hydrate)│     │  (Response)  │
└─────────┘     └─────────────────┘     └──────────────┘
```

---

## 5. Datenfluss (Event-Erstellung)

```
┌─────────┐     ┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│  Admin  │────▶│  Admin-Form     │────▶│  API Route   │────▶│   Prisma   │
│         │     │  (Client)       │     │  (POST)      │     │   Insert   │
└─────────┘     └─────────────────┘     └──────────────┘     └────────────┘
                                                 │                 │
                                                 │                 ▼
                                                 │           ┌────────────┐
                                                 │           │  Supabase  │
                                                 │           │  Postgres  │
                                                 │           └────────────┘
                                                 ▼
                                        ┌──────────────┐
                                        │  Response    │
                                        │  { success } │
                                        └──────────────┘
                                                 │
                                                 ▼
                                        ┌──────────────┐
                                        │  Redirect    │
                                        │  /admin      │
                                        └──────────────┘
```

---

## 6. Datenbank-Schema (ER-Diagramm)

```
┌──────────────────────────────────────────────────────────────────────┐
│                              EVENT                                    │
├──────────────────────────────────────────────────────────────────────┤
│ PK  id              UUID                                              │
│     title           VARCHAR(255)                                    │
│     description     TEXT                                              │
│     dateStart       TIMESTAMP                                         │
│     dateEnd         TIMESTAMP (nullable)                              │
│     locationName    VARCHAR(255)                                    │
│     locationAddress VARCHAR(500) (nullable)                           │
│     latitude        DECIMAL(10,8) (nullable)                          │
│     longitude       DECIMAL(11,8) (nullable)                          │
│     category        ENUM(MUSIC, CULTURE, PARTY,                      │
│                        FLEAMARKET, UNI, SPORT, OTHER)                 │
│     imageUrl        VARCHAR(500) (nullable)                           │
│     sourceUrl       VARCHAR(500) (nullable)                           │
│     isFeatured      BOOLEAN DEFAULT false                             │
│     status          ENUM(DRAFT, PUBLISHED, ARCHIVED)                  │
│     createdAt       TIMESTAMP DEFAULT now()                           │
│     updatedAt       TIMESTAMP                                         │
├──────────────────────────────────────────────────────────────────────┤
│ INDEX: dateStart, category, status                                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Post-MVP Erweiterungen:**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    USER      │────▶│   FAVORITE   │◀────│    EVENT     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ PK id        │     │ PK id        │     │ PK id        │
│    email     │     │ FK userId    │     │ ...          │
│    name      │     │ FK eventId   │     │              │
│    role      │     │    createdAt │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 7. Deployment-Architektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GITHUB                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Repository: FM999ZO/karlsruhe-events                      │   │
│  │  ├── main branch  ───────▶  Production                    │   │
│  │  ├── develop branch ─────▶  Staging                       │   │
│  │  └── feature/*    ─────▶  Preview Deployments           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Push / PR / Merge
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          VERCEL                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Build Pipeline                                            │   │
│  │  ├── Install dependencies (npm ci)                        │   │
│  │  ├── Generate Prisma Client                               │   │
│  │  ├── Build Next.js (next build)                           │   │
│  │  └── Deploy to Edge Network                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Runtime Environment                                         │   │
│  │  ├── Node.js 20.x                                           │   │
│  │  ├── Next.js Serverless Functions                          │   │
│  │  └── Edge Functions (optional)                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL Queries
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                     │
│  ┌────────────────────┐      ┌────────────────────┐                │
│  │   PostgreSQL       │      │    Storage         │                │
│  │   (Primary)        │      │    (Images)        │                │
│  └────────────────────┘      └────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security-Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 1: Transport                                                 │
│  ├── HTTPS (TLS 1.3)                                                │
│  └── HSTS Header                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 2: Application                                               │
│  ├── Input Validation (Zod)                                         │
│  ├── XSS Protection (React + CSP)                                   │
│  └── CSRF Tokens (Next.js built-in)                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 3: Authentication                                            │
│  ├── HTTP Basic Auth (MVP)                                          │
│  └── Supabase Auth (später)                                         │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 4: Data Access                                               │
│  ├── Row Level Security (RLS) - später                              │
│  └── Prisma ORM (parameterized queries)                             │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 5: Infrastructure                                            │
│  ├── Environment Variables (never exposed)                          │
│  └── Database Credentials (restricted)                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Performance-Optimierungen

```
┌─────────────────────────────────────────────────────────────────────┐
│  Strategie                    │ Implementierung                    │
├─────────────────────────────────────────────────────────────────────┤
│  Static Generation              │ Revalidate (ISR) für Event-Liste   │
│  (Next.js ISR)                  │                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Image Optimization             │ next/image mit Cloudinary/         │
│                                 │ Supabase Storage                   │
├─────────────────────────────────────────────────────────────────────┤
│  Database Queries               │ Indexed columns, pagination        │
│                                 │ (LIMIT + OFFSET)                   │
├─────────────────────────────────────────────────────────────────────┤
│  CDN Caching                    │ Vercel Edge Network                │
│                                 │ (Cache-Control headers)            │
├─────────────────────────────────────────────────────────────────────┤
│  Code Splitting                 │ Next.js automatic                  │
│                                 │ (route-based splitting)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Erstellt: 2026-04-13*
