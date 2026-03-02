# UpaUpa — Product Specification

**Version:** 2.1  
**Last Updated:** March 2, 2026  
**Author:** JP  
**Status:** Phase 1 MVP — Built & Running

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [User Profile](#user-profile)
4. [Design System](#design-system)
5. [Tech Stack](#tech-stack)
6. [Information Architecture](#information-architecture)
7. [Data Models](#data-models)
8. [Screen Specifications](#screen-specifications)
9. [Business Logic & Rules](#business-logic--rules)
10. [CRUD Operations & Cascade Behavior](#crud-operations--cascade-behavior)
11. [Storage & Persistence](#storage--persistence)
12. [Defaults & Assumptions](#defaults--assumptions)
13. [Phase Roadmap](#phase-roadmap)
14. [Migration Path (Prototype → Production)](#migration-path-prototype--production)
15. [Success Metrics](#success-metrics)
16. [Open Questions](#open-questions)

---

## Overview

UpaUpa is a mini property management web app for small-scale landlords managing 1–3 apartment buildings. It replaces pen-and-paper rent tracking with a clean, mobile-friendly digital system.

The name "UpaUpa" is Filipino shorthand — approachable, memorable, easy to say over the phone.

**Core promise:** The owner can answer these questions in under 10 seconds:

- Who hasn't paid this month?
- How much rent is collected vs. expected?
- What's broken and what's the repair status?
- When do leases expire?

---

## Problem Statement

The target user (JP's mother-in-law) manages two small apartment buildings in Metro Manila using a paper notebook. This creates several pain points:

- No quick way to see who has or hasn't paid in a given month
- Manual addition to calculate total collections
- No record of payment method (GCash, cash, bank transfer)
- Difficult to track partial payments over time
- No maintenance request history — verbal agreements get forgotten
- Lease expiry dates are easy to miss

UpaUpa solves the highest-impact problem first (payment tracking) and layers on maintenance and lease management in later phases.

---

## User Profile

**Primary User:** Single landlord (the owner), non-technical, 50s–60s, uses a smartphone daily (Facebook, GCash), comfortable with simple apps but not power-user workflows.

**Usage Pattern:**
- Checks the app 2–4× per month, primarily around rent due dates (1st–10th of month)
- Records payments as they come in (often immediately after receiving GCash notification)
- Quick glance at dashboard to see who hasn't paid
- Occasional review of maintenance issues

**Device:** Primarily mobile (Android phone), occasionally desktop/tablet

**Language:** English UI with Filipino-friendly naming conventions. ₱ peso formatting throughout.

---

## Design System

### Inspiration

Airbnb's card-based UI — generous whitespace, rounded corners, soft shadows, warm neutrals with clear status color coding.

### Principles

- **Mobile-first** — all screens designed for phone-width first, scales up for desktop
- **Card-based layouts** — buildings, units, tenants, and payments all render as cards
- **Status at a glance** — color-coded pills for every status (payment, occupancy, tenant)
- **Big tap targets** — buttons and interactive cards are easily tappable on mobile
- **Minimal navigation** — 4 tabs max: Dashboard, Buildings, Tenants, Payments
- **Modals for all forms** — add/edit actions open modal overlays, not separate pages

### Typography

- **Font:** DM Sans (Google Fonts) — warm, rounded, high readability
- **Headings:** 2xl/bold for page titles, lg/semibold for card titles
- **Body:** sm for descriptions, xs for metadata and labels

### Color System

| Token | Color | Usage |
|---|---|---|
| Background | `#f8f7f4` (warm off-white) | App background |
| Surface | White | Cards, modals, sidebar |
| Border | `zinc-200/80` | Card borders, dividers |
| Text Primary | `zinc-900` | Headings, values |
| Text Secondary | `zinc-500` | Labels, descriptions |
| Text Muted | `zinc-400` | Metadata, hints |
| Nav Active | `zinc-900` (bg) + white (text) | Active sidebar item |
| Nav Inactive | `zinc-600` text | Inactive sidebar items |

### Status Colors

| Status | Background | Text | Border | Context |
|---|---|---|---|---|
| Paid / Occupied / Active | `emerald-100` | `emerald-700` | `emerald-200` | Positive states |
| Partial | `amber-100` | `amber-700` | `amber-200` | Needs attention |
| Late / Overdue | `red-100` | `red-700` | `red-200` | Urgent |
| Unpaid / Vacant / Moved Out | `zinc-100` | `zinc-500` | `zinc-200` | Neutral/inactive |

### Component Patterns

| Component | Style |
|---|---|
| Cards | `rounded-lg` border, `shadow-sm`, `hover:shadow-md` transition |
| Buttons (primary) | `rounded-full`, `bg-zinc-900`, white text |
| Buttons (ghost) | `rounded-full`, transparent, visible on card hover |
| Modals | `rounded-2xl`, `backdrop-blur-sm`, `shadow-2xl` |
| Status Pills | `rounded-full`, colored bg + text + border, `text-xs font-medium` |
| Inputs | Default shadcn/ui styling |
| Selects | `rounded-xl` trigger |
| Empty States | Centered icon + title + subtitle + optional CTA button |
| Confirm Dialogs | Centered modal, cancel + red delete button |

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| Mobile (<1024px) | Hamburger menu, stacked cards, sticky top header |
| Desktop (≥1024px) | Fixed sidebar (240px), grid cards (2–3 columns) |

---

## Tech Stack

### Current (Prototype / Phase 1)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React (JSX) | Single-file component in Claude artifact |
| UI Components | shadcn/ui | Card, Button, Input, Label, Badge, Separator, Select |
| Styling | Tailwind CSS | Utility-first, no custom CSS except font import + scrollbar |
| Icons | lucide-react | 18 icons used across the app |
| Typography | DM Sans | Loaded via Google Fonts CDN |
| Storage | `window.storage` API | Claude artifact persistent key-value storage |
| IDs | `crypto.randomUUID()` | UUID v4 for all entity IDs |

### Production (Target)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Type safety, fast builds |
| UI | shadcn/ui + Tailwind CSS | Same as prototype — no redesign needed |
| Backend/DB | Supabase (Postgres + Auth + Storage) | Auth, DB, file storage in one platform |
| Hosting | Vercel | Auto-deploy from GitHub, free tier |
| File Storage | Supabase Storage | Receipt photo uploads |

---

## Information Architecture

```
UpaUpa
├── Dashboard (home)
│   ├── Month selector
│   ├── Stat cards (Collected, Overdue, Occupied, Tenants)
│   ├── Collection progress bar
│   └── "Needs Attention" overdue list
│
├── Buildings
│   ├── Building list (cards with occupancy + collection %)
│   │   ├── Add Building (modal)
│   │   ├── Edit Building (modal)
│   │   └── Delete Building (confirm dialog)
│   │
│   └── Building Detail (drill-in)
│       ├── Unit grid (cards with tenant + payment status)
│       │   ├── Add Unit (modal)
│       │   ├── Edit Unit (modal)
│       │   └── Delete Unit (confirm dialog)
│       └── Back to buildings
│
├── Tenants
│   ├── Search bar
│   ├── Tenant cards (name, unit, phone, lease, payment status)
│   │   ├── Add Tenant (modal)
│   │   ├── Edit Tenant (modal)
│   │   └── Delete Tenant (confirm dialog)
│   └── Empty state when no tenants
│
└── Payments
    ├── Month selector
    ├── Summary strip (Expected / Collected / Outstanding)
    ├── Search bar
    ├── CSV Export button
    ├── Record Payment button
    └── Ledger rows (per occupied unit)
        ├── Click → Record Payment (modal, if no payment exists)
        └── Click → Edit Payment (modal, if payment exists)
```

---

## Data Models

### Building

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | auto | Primary key |
| name | string | ✓ | e.g., "Building A" |
| address | string | — | Full address |
| totalUnits | integer | — | Informational — actual count derived from Units |

### Unit

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | auto | Primary key |
| buildingId | UUID (FK → Building) | ✓ | Parent building |
| label | string | ✓ | e.g., "Unit 3A", "Room B" |
| floor | integer | — | Floor number |
| monthlyRent | decimal | ✓ | Amount in PHP (₱) |
| status | enum | ✓ | `occupied` · `vacant` |

### Tenant

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | auto | Primary key |
| unitId | UUID (FK → Unit) | ✓ | Linked unit (one tenant per unit) |
| firstName | string | ✓ | |
| lastName | string | — | |
| phone | string | — | Philippine mobile format (09XX) |
| email | string | — | |
| moveInDate | date | — | Defaults to today |
| leaseEndDate | date | — | Nullable — not all leases have end dates |
| emergencyContact | string | — | |
| status | enum | auto | `active` · `moved_out` |

### Payment

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | auto | Primary key |
| unitId | UUID (FK → Unit) | ✓ | |
| tenantId | UUID (FK → Tenant) | ✓ | Auto-resolved from unit's active tenant |
| month | date | ✓ | First of month, e.g., `2026-03-01` |
| amountDue | decimal | ✓ | Pre-filled from unit's monthlyRent |
| amountPaid | decimal | ✓ | Can be 0 (unpaid) or partial |
| status | enum | ✓ | `paid` · `partial` · `late` · `unpaid` |
| method | enum | ✓ | `gcash` · `bank_transfer` · `cash` · `check` · `other` |
| datePaid | date | — | Nullable — unpaid has no date |
| receiptUrl | string | — | File path/URL for receipt photo (Phase 1: unused, reserved) |
| notes | text | — | Free-text, e.g., "Promised to pay by 15th" |

### Settings (app-level)

| Field | Type | Default | Notes |
|---|---|---|---|
| dueDay | integer | 5 | Day of month rent is due |

### Entity Relationships

```
Building 1 ──── * Unit
Unit     1 ──── 1 Tenant (active)
Unit     1 ──── * Payment (one per month)
Tenant   1 ──── * Payment
```

One active tenant per unit. A unit can have historical tenants (status: moved_out). Payments are keyed by `unitId + month` — one payment record per unit per month (upsert behavior).

---

## Screen Specifications

### Dashboard

**Purpose:** At-a-glance monthly overview — the "home screen" that replaces the notebook.

**Components:**
1. **Page header** — title "Dashboard" + month selector dropdown (5 months: ±2 from current)
2. **Stat cards** (2×2 grid on mobile, 4-column on desktop):
   - **Collected** — total ₱ paid this month, subtitle shows collection rate % + total due
   - **Overdue** — count of late + unpaid, subtitle shows outstanding ₱ amount. Red accent if > 0
   - **Occupied** — occupied/total units ratio, subtitle shows vacant count
   - **Tenants** — count of active tenants
3. **Collection progress bar** — full-width bar showing paid/due ratio with ₱ labels
4. **"Needs Attention" card** — only appears if overdue > 0:
   - Red-tinted card with alert icon header
   - Lists each overdue payment row: tenant avatar initial, name, building → unit, status pill, outstanding amount
   - Each row is clickable → opens Edit Payment modal
5. **"All caught up" card** — appears when overdue = 0 and payments exist: green success banner

**Interactions:**
- Month selector changes all dashboard data
- Overdue rows click → Edit Payment modal

### Buildings

**Purpose:** Manage physical properties and their units.

**Two states:**

**A) Building List (default)**
- Grid of building cards (1 column mobile, 2 columns desktop)
- Each card shows: name, address, unit count, occupancy ratio, collection %, mini progress bar
- Hover reveals Edit + Delete ghost buttons
- Click card → drills into Building Detail
- "Add Building" button (top right)

**B) Building Detail (drill-in)**
- Back arrow + building name + address as header
- Unit count + "Add Unit" button
- Grid of unit cards (1–3 columns responsive)
- Each unit card: label, floor, monthly rent, status pill, tenant name + avatar initial, payment status pill
- Hover reveals Edit + Delete ghost buttons

**Interactions:**
- Add Building → modal (name, address, total units)
- Edit Building → modal (pre-filled)
- Delete Building → confirm dialog (cascades: deletes all units, tenants, payments)
- Add Unit → modal (label, floor, rent, status)
- Edit Unit → modal (pre-filled)
- Delete Unit → confirm dialog (cascades: deletes linked tenant + payments)

### Tenants

**Purpose:** Manage tenant profiles and see their status at a glance.

**Components:**
1. Header + "Add Tenant" button
2. Search bar — filters by name or phone number
3. Tenant card grid (1–3 columns responsive)

**Each tenant card:**
- Avatar circle (first + last initial)
- Full name, building → unit location
- Status pill (active / moved out)
- Phone number (with icon)
- Lease end date (with icon)
- "This month" payment status pill (if payment exists)
- Hover reveals Edit + Delete ghost buttons

**Interactions:**
- Add Tenant → modal (first name, last name, unit selector, phone, move-in date, lease end date)
  - Unit selector only shows vacant units (+ current unit if editing)
  - Adding a tenant auto-sets the unit status to `occupied`
- Edit Tenant → modal (pre-filled)
- Delete Tenant → confirm dialog (cascades: removes payment history, sets unit to `vacant`)
- Search → real-time filter by name or phone substring

### Payments

**Purpose:** Monthly rent ledger — the core of Phase 1.

**Components:**
1. Header with month label + month selector + "Record" button + "CSV" export button
2. **Summary strip** (3 cards in a row):
   - Expected — total amountDue for the month
   - Collected — total amountPaid (green accent)
   - Outstanding — difference (red accent)
3. Search bar — filters by tenant name, unit label, or building name
4. **Ledger rows** — one card per occupied unit:
   - Status icon (checkmark / clock / alert based on status)
   - Building → Unit label
   - Tenant name + payment method label
   - Amount paid / amount due
   - Status pill
   - Notes (italic, if present)
   - Entire row clickable → opens payment form modal

**Interactions:**
- Record Payment → modal with: unit selector (shows building → unit + tenant name), month selector, amount due (pre-filled from unit rent), amount paid, status, method, date paid, notes
- Edit Payment → same modal, pre-filled
- Auto-status: when amount paid changes, status auto-calculates (paid if ≥ due, partial if > 0 but < due, unpaid if 0)
- Status can be manually overridden (e.g., to mark as "late" even if paid)
- CSV Export → downloads `UpaUpa-{Month}-{Year}.csv` with columns: Building, Unit, Tenant, Due, Paid, Status, Method, Date Paid, Notes

---

## Business Logic & Rules

### Payment Status Auto-Calculation

When `amountPaid` changes in the payment form:
- `amountPaid ≥ amountDue && amountPaid > 0` → `paid`
- `amountPaid > 0 && amountPaid < amountDue` → `partial`
- `amountPaid === 0` → `unpaid`

Status can always be manually overridden after auto-calculation (e.g., marking as `late`).

### Payment Upsert Logic

Payments are uniquely identified by `unitId + month`. When recording a payment:
- If a payment with that unitId + month already exists → **update** the existing record
- If no payment exists → **create** a new record

This prevents duplicate payment records for the same unit in the same month.

### Tenant ↔ Unit Linking

- Adding a tenant to a unit → unit status auto-sets to `occupied`
- Deleting a tenant → unit status auto-sets to `vacant`
- Only one active tenant per unit (enforced by unit selector showing only vacant units)
- Editing a tenant does NOT auto-change unit status (manual operation)

### Unit Selection in Payment Form

- Auto-resolves tenant: selecting a unit auto-fills the tenantId from the unit's active tenant
- Auto-fills amountDue from the unit's monthlyRent

### Month Handling

- Month values stored as first-of-month date strings: `"2026-03-01"`
- Month selector offers 5 months: 2 months before current, current month, 2 months after
- Dashboard and Payments page share the same month selector state

---

## CRUD Operations & Cascade Behavior

### Building

| Action | Cascades |
|---|---|
| Add | Creates building record only |
| Edit | Updates building fields only |
| Delete | **Deletes:** all units in building → all tenants in those units → all payments for those units |

### Unit

| Action | Cascades |
|---|---|
| Add | Creates unit record only |
| Edit | Updates unit fields only |
| Delete | **Deletes:** linked tenant(s) → all payments for this unit |

### Tenant

| Action | Cascades |
|---|---|
| Add | Creates tenant + sets unit status to `occupied` |
| Edit | Updates tenant fields only |
| Delete | **Deletes:** all payments for this tenant + sets unit status to `vacant` |

### Payment

| Action | Cascades |
|---|---|
| Add / Upsert | Creates or updates payment — no cascade |
| (No delete UI) | Payments are edited, not deleted, by design |

---

## Storage & Persistence

### Current (Prototype)

All data stored in a single key-value entry via Claude's `window.storage` API:

- **Key:** `upaupa-data`
- **Value:** JSON string containing `{ buildings, units, tenants, payments, settings }`
- **Scope:** Personal (not shared)
- **Persistence:** Survives across sessions
- **Limit:** 5MB per key (more than sufficient for ~100 units)

Every state change triggers a full save of the entire data object. This is acceptable for the prototype scale (< 500 records total).

### Production (Target)

Migrate to Supabase Postgres with one table per entity. Row Level Security (RLS) from day one. Receipt photos in Supabase Storage.

---

## Defaults & Assumptions

These defaults were chosen to avoid blocking the build on unanswered questions. All are editable by the user through the UI.

| Question | Default | Editable? |
|---|---|---|
| Rent due date | 5th of each month | Settings (stored, not yet exposed in UI) |
| Default payment method | GCash | Per payment — dropdown |
| Building names | "Building A", "Building B" | Editable in building form |
| Currency | Philippine Peso (₱) | Hardcoded for now |
| Language | English | Hardcoded for now |
| Deposit tracking | Not included | Future phase |
| Tenant visibility | Landlord-only (no tenant portal) | Future phase |
| Multiple users | Single user | Future phase |
| Receipt photos | Field reserved (receiptUrl), upload not yet wired | Phase 1.5 or production |

---

## Phase Roadmap

### ✅ Phase 1: Payments MVP (Built)

**Status:** Complete — running as interactive prototype.

- Dashboard with collection overview
- Buildings CRUD with drill-in to units
- Units CRUD with occupancy management
- Tenants CRUD with unit linking
- Monthly rent ledger with upsert behavior
- Payment methods: GCash, Bank Transfer, Cash, Check, Other
- Auto-status calculation (paid/partial/unpaid)
- CSV export
- Persistent storage
- Seed data for demo/testing
- Mobile-responsive layout with sidebar/hamburger nav

### Phase 1.5: Production Migration

**Goal:** Move from prototype to deployed web app.

- Initialize Vite + React + TypeScript project
- Set up Supabase project (Postgres tables, RLS policies, Storage bucket)
- Migrate data models to SQL with proper constraints and indexes
- Set up Supabase Auth (email/password, single user)
- Wire receipt photo upload to Supabase Storage
- Deploy to Vercel with environment variables
- Add data import tool (migrate seed data → Supabase)
- Basic error handling and loading states for network requests

### Phase 2: Maintenance Tracking

**Goal:** Track what's broken, what it costs, and whether it's fixed.

**New data model: MaintenanceRequest**

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| unitId | UUID (FK, nullable) | Some requests are building-wide |
| buildingId | UUID (FK) | |
| title | string | |
| description | text | |
| priority | enum | `low` · `medium` · `high` · `urgent` |
| status | enum | `open` · `scheduled` · `in_progress` · `done` |
| repairCost | decimal (nullable) | |
| targetDate | date (nullable) | |
| completedAt | timestamp (nullable) | |
| photoUrls | string[] (nullable) | Supabase Storage paths |
| notes | text (nullable) | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**New screens:**
- Maintenance list (filterable by status, priority, building)
- Create/edit maintenance request (modal)
- Maintenance dashboard widgets (open count, monthly expense)

### Phase 3: Lease & Tenant Intelligence

**Goal:** Proactive alerts and historical insights.

- Lease expiry warnings (30/60/90 days out)
- Tenant payment history view (consistency score, average days late)
- Vacancy duration tracker (days since unit went vacant)
- Rent adjustment history per unit
- Private landlord notes per tenant

### Phase 4: Polish & Growth

**Goal:** Multi-user support and quality-of-life features.

- Multi-user auth (owner + property manager roles)
- Push notifications / SMS reminders for overdue rent
- Annual financial summary / tax report export
- Feedback system for app improvement (internal use)
- Dark mode
- PWA support (install to phone home screen)
- Bilingual UI (English / Filipino toggle)

---

## Migration Path (Prototype → Production)

### What Transfers Directly

The prototype was built with production UI patterns. These carry over with zero redesign:

- All screen layouts and component hierarchy
- shadcn/ui components (same library in production)
- Tailwind classes (identical)
- DM Sans typography
- Status color system
- Modal/form patterns
- Navigation structure
- CSV export logic
- Business logic (auto-status, upsert, cascade deletes)

### What Changes

| Prototype | Production |
|---|---|
| `window.storage` (JSON blob) | Supabase Postgres (tables + RLS) |
| `crypto.randomUUID()` | Supabase auto-generated UUIDs |
| In-memory state only | React Query or SWR for server state |
| No auth | Supabase Auth (email/password) |
| No file uploads | Supabase Storage for receipts |
| Single JSX file | Vite project with component tree |
| No error handling for network | Loading states, error boundaries, retry logic |
| No timestamps | `createdAt` / `updatedAt` on all tables |

### Suggested Production Project Structure

```
upaupa/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              ← shadcn/ui primitives
│   │   ├── layout/          ← Shell, Sidebar, Header, Modal
│   │   ├── shared/          ← StatusPill, StatCard, EmptyState, ConfirmDialog
│   │   ├── dashboard/       ← DashboardPage, stat widgets
│   │   ├── buildings/       ← BuildingList, BuildingDetail, BuildingForm
│   │   ├── units/           ← UnitCard, UnitForm
│   │   ├── tenants/         ← TenantList, TenantCard, TenantForm
│   │   ├── payments/        ← PaymentsPage, PaymentRow, PaymentForm
│   │   └── maintenance/     ← (Phase 2)
│   ├── lib/
│   │   ├── supabase.ts      ← Supabase client init
│   │   ├── types.ts         ← TypeScript types mirroring DB schema
│   │   ├── utils.ts         ← peso(), fmtDate(), monthLabel(), etc.
│   │   └── csv.ts           ← CSV export logic
│   ├── hooks/
│   │   ├── useBuildings.ts
│   │   ├── useUnits.ts
│   │   ├── useTenants.ts
│   │   ├── usePayments.ts
│   │   └── useAuth.ts
│   ├── pages/               ← Route-level components
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/           ← SQL migration files
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Success Metrics

### For the User (Mother-in-Law)

| Metric | Target |
|---|---|
| Time to check "who hasn't paid" | < 10 seconds (open app → dashboard) |
| Adopts app over notebook | Within 1 month of launch |
| Can record payment independently | After 1 walkthrough session |
| Verbal confirmation | "Ito na lang gamitin natin" (let's just use this) |

### For the Builder (JP)

| Metric | Target |
|---|---|
| Phase 1 prototype | ✅ Built |
| Production deploy (Phase 1.5) | ≤ 2 weekends |
| Full Phase 1 with auth + receipts | ≤ 1 month |
| Phase 2 (maintenance) | ≤ 2 weeks after Phase 1 stable |
| Portfolio piece | Deployed URL + case study |

---

## Open Questions

These are non-blocking — sensible defaults are already in place. Answers will refine the UX:

- [ ] What does she call her buildings? (Update seed data names)
- [ ] How many units total across both buildings? (Update seed data)
- [ ] Does she track deposits or advance payments? (May need a deposits field)
- [ ] Preferred rent due date? (Default: 5th — stored in settings)
- [ ] Should tenants see anything, or is this 100% landlord-side? (Default: landlord-only)
- [ ] Filipino or English UI? Or bilingual with toggle? (Default: English)
- [ ] Does she want SMS/notification reminders for overdue tenants? (Phase 4)
- [ ] Is there ever more than one tenant per unit (e.g., shared rooms)? (Default: one tenant per unit)
- [ ] Does rent ever change mid-lease? (Currently editable per unit, no history tracking)
