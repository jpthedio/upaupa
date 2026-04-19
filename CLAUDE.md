# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

UpaUpa is a Filipino rental-management SPA for small-scale landlords (target persona documented in `src/USER.md`). Full product spec is in `SPEC.md`; shipping/deployment pipeline notes live in `SHIPIT.md`.

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server (localhost:5173)
npm run build        # production build to dist/
npm run preview      # preview the built bundle
```

There is no test runner, linter, or type checker configured — `npm run build` is the only automated correctness check. Do not invent scripts; ask before adding tooling.

## Environment

Supabase is **optional**. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are unset the app still runs as a pure localStorage/offline app — guarded everywhere by `hasSupabase` and `if (supabase)`. Do not assume either mode; new code that touches persistence must handle both.

## Architecture

### Persistence: dual-mode with optimistic local writes

`src/context/AppContext.jsx` is the center of the owner-side app. Every mutation (`addBuilding`, `editUnit`, `archiveTenant`, `upsertPayment`, …) follows the same pattern:

1. Synchronously update in-memory React state via `update(fn)`, which also writes the whole data blob to `localStorage` (`upaupa-data`).
2. Fire-and-forget a Supabase write (`dbInsert` / `dbUpdate` / `dbDelete` / `dbUpsertPayment` in `src/lib/storage.js`) when signed in.

Consequences:
- The localStorage blob is always the source of truth for the current session; Supabase is the durable copy across devices.
- Supabase writes are best-effort — errors are only logged. Do not add blocking await/toast flows for network failures without discussing it.
- On load, `AppContext` tries Supabase first (`fetchAllData(teamId)`), then falls back to localStorage, then to `emptyData()`.

### Auth → role resolution → three app shells

`src/App.jsx` → `AuthProvider` → `AuthGate` picks one of four UIs based on what `ensureTeam(userId)` in `src/lib/team.js` returns:

| Result from `ensureTeam` | UI | Provider |
|---|---|---|
| existing `team_members` row | owner app | `AppProvider` → `Shell` |
| pending `team_invites` row (by email) | owner app (auto-accepts invite) | `AppProvider` → `Shell` |
| `tenant_portal_access` row (by email) | read-only renter portal | `TenantProvider` → `TenantShell` |
| none of the above | `<RolePicker>` asks owner vs tenant | — |

A new user who clicks "I'm a building owner" calls `createTeamForOwner` which inserts into `teams` + `team_members` and then drops into the owner app. Tenants cannot self-serve — a landlord must `inviteToPortal(tenantId)` first, which upserts `tenant_portal_access` keyed by email.

`#logout` in the URL hash is a hard-reset escape hatch: it removes the `upaupa-auth` key and reloads.

### Roles & permissions

`team.role` is `"owner"` | `"member"`; `team.isAdmin` comes from the separate `app_admins` table (app-wide admin, not team-admin). `AppContext` enforces owner-only operations client-side:

- `deleteBuilding`, `deleteUnit`, `archiveTenant`, `updateSettings`, `inviteToPortal`, `revokePortalAccess` all early-return for non-owners.
- The Analytics tab is only added to the nav when `isAdmin`.

Supabase RLS is the real boundary — client-side checks are UX, not security. When adding a mutation, mirror the pattern (role gate → local update → remote call) rather than inventing a new one.

### camelCase ↔ snake_case boundary

App code uses camelCase (`buildingId`, `amountDue`). Supabase uses snake_case. `src/lib/db-mapping.js` (`toSnake`, `toCamel`, `rowsToCamel`) is the only place this conversion lives and every read/write in `storage.js` / `team.js` / `migrate.js` goes through it. If you add a DB column, update both the SQL migration and trust the auto-mapping — don't hand-roll field translation.

### Data model invariants

- Payment uniqueness is `unitId + month` — `upsertPayment` finds-or-creates by that composite key. Month is always a `"YYYY-MM-01"` string (see `currentMonth()` in `src/lib/helpers.js`).
- Adding a tenant flips the unit to `occupied`; archiving/deleting flips it to `vacant`. Both the tenants row and the units row must be updated together (see `addTenant`, `archiveTenant`).
- Due day resolution cascades: tenant → building → global settings. Always route through `getEffectiveDueDay(tenant, building, settings.dueDay)`.
- Cascade deletes are done client-side in `deleteBuilding` / `deleteUnit` by filtering arrays; the matching `ON DELETE CASCADE` in SQL handles the server side. Keep both in sync.

### Routing

There is no router. `AppContext.page` is a string (`"dashboard"` | `"buildings"` | …) toggled by `navigate()`; `Shell.jsx` switches on it. Don't add React Router without discussion — the whole UX, including the mobile bottom nav, assumes this flat model.

### One-time migration from localStorage → Supabase

`src/lib/migrate.js` runs on first sign-in when local data exists and the `upaupa-migrated` flag isn't set. `Shell.jsx` surfaces it as a dismissible banner. If you change the data schema, update `migrateLocalToSupabase` too or old offline users will silently lose fields on upload.

### Conventions

- Path alias `@/` → `src/` (see `vite.config.js`). Always import via `@/...`.
- Styling is Tailwind v4 via `@tailwindcss/vite` — no `tailwind.config.js`; theme tokens live in `src/index.css` under `@theme`. Don't create a config file unless plugins require it.
- UI primitives in `src/components/ui/` are shadcn-style (Radix + `cn()` from `src/lib/utils.js`). Higher-level shared pieces (`Modal`, `Toast`, `ConfirmDialog`, `StatusPill`, `StatCard`) live in `src/components/shared/`.
- Status colors are centralized in `src/lib/constants.js` (`STATUS_COLORS`, `METHOD_LABELS`) — reuse instead of hardcoding Tailwind classes.
- Money is always rendered via `peso()` from `helpers.js` (₱ + `en-PH` locale, no decimals).
- Modals are driven by `modal` state in `AppContext` (`setModal({ type: "addTenant" })`); `Shell` renders the modal tree. New dialogs should plug into this rather than owning their own open/close state.
- Destructive actions go through `setConfirm({ msg, fn })` → `<ConfirmDialog>`; soft-destructive actions (like archive) use `showToast(msg, undoFn)`.

## Repo layout quirks

- `upaupa.jsx` at the repo root is the **original single-file Claude Artifact** that predates the multi-file refactor (commit `a186374`). It is not imported by the build — `src/App.jsx` is the entry point. Treat the root file as frozen history unless explicitly asked to touch it.
- `supabase/migrations/*.sql` must be applied manually in the Supabase SQL editor; there is no migration runner wired into the app.
- The `.gitignore` excludes `.claude/` — agent-local state should stay there.
