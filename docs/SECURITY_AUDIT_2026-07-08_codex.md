# Security Audit — Codex, 2026-07-08

**Audited commit:** `28eb386` (Split every route into a lazy-loaded chunk)
**Auditor:** Codex, OWASP Top 10 / ASVS / API Security Top 10 framing
**Status:** Findings recorded, not yet remediated. Given to Base44.

> **Headline:** Lazy loading helped performance but does **not** create an
> authorization boundary. The biggest risks are still serverless/API
> authorization, service-role exposure, automation endpoints, and dependency
> hygiene. Splitting code into chunks does not restrict who can call a
> function or fetch a chunk — every route chunk is still publicly downloadable.

Line references are to commit `28eb386`. Items spot-checked against a later HEAD
are marked **[still present]**.

---

## P0 / Critical

### 1. Unauthenticated automation/notification endpoints can email subscribers
`notify-ferry-alert` accepts `body.data`, reads subscriber preferences with
service role, sends email, and returns subscriber counts — with **no auth
check**: `notify-ferry-alert/entry.ts:6`, `:19`, `:68`. `notify-new-event` has
the same issue behind only a weak `status === 'synced'` check:
`notify-new-event/entry.ts:6`.
**[still present]** — confirmed no auth gate before the service-role read.
OWASP: API5 Broken Function Level Authorization, API4 Unrestricted Resource
Consumption, Security Misconfiguration.

### 2. "Scheduled automation" functions treat auth failure as permission to run
`sync-ferry-status`, `sync-old-baldy-events`, and `sync-all-island-events` set
`isScheduled = true` when `auth.me()` throws, then invoke LLM/web sync and
write service-role records: `sync-ferry-status/entry.ts:31`,
`sync-old-baldy-events/entry.ts:40`, `sync-all-island-events/entry.ts:418`.
`reviewSubmission` similarly permits automation-shaped unauthenticated calls to
load/update submissions: `reviewSubmission/entry.ts:11`.
**Fix first:** require a signed automation secret/header or Base44-native
automation identity, and **fail closed** on missing auth. This is the same
anti-pattern across every automation endpoint — a shared helper is the fix.

### 3. Lazy admin chunks still contain browser-side `base44.asServiceRole`
Direct service-role calls remain in the client bundle: `EventsAdmin.jsx:27`,
`PartnersAdmin.jsx:28`, `BabysittingAdmin.jsx:21` (and more throughout those
three files). **[still present]** — verified live at HEAD. Note
`src/lib/adminClient.js` explicitly documents "Never call
`base44.asServiceRole`" client-side, so these pages violate an intended
pattern. If the SDK honors service role client-side, this is privilege
escalation; if it blocks it, those lazy admin paths are simply broken. Either
way, remove it — route through `admin-ops` or a targeted server function.

---

## P1 / High

### 4. `admin-ops` is admin-gated but too broad
Exposes generic service-role `list/filter/get/create/update/delete/bulkCreate`
over many sensitive entities with arbitrary `query`/`data`:
`admin-ops/entry.ts:3`, `:21`, `:31`. Add per-entity field allowlists,
operation allowlists, audit logging, and safer error responses.

### 5. Community interaction counters are forgeable
Any authenticated user can increment/decrement likes/comments and repeatedly
report posts/comments until content auto-hides: `community-interact/entry.ts:10`,
`:38`. (The earlier ±1 clamp limits per-call magnitude but not repeat calls or
self-reporting.) **Real fix:** store `Like`, `Report`, and `Comment` rows keyed
by user+content, then derive counts — dedupe at the data layer.

### 6. Booking/order functions improved trust boundaries, but writes are non-atomic
Good: server-side pricing now exists for ferry/rental/food. Risk:
capacity/inventory/order/revenue writes can race or partially complete:
`book-ferry/entry.ts:52`, `book-rental/entry.ts:73`, `place-food-order/entry.ts:78`.
Add idempotency keys, transactional semantics if available, and
rollback/reconciliation jobs.

---

## P2 / Medium

### 7. Route/auth cleanup needed after lazy loading
`ProtectedRoute` expects `authChecked` and `checkUserAuth`, but `AuthContext`
does not export them: `ProtectedRoute.jsx:13`, `AuthContext.jsx:137` (dead/
broken component). `/admin/events` and `/admin/partners` are duplicated, and
public turtle routes are nested under `AdminShell`: `App.jsx:271`.

### 8. Public RLS exposes some internal fields
The private babysitter/shopper split was a good improvement. Remaining public
records still expose fields like `owner_email`, `commission_rate`,
`subscription_status`, internal restaurant notes, and reviewer emails:
`Shop.jsonc:43`, `Restaurant.jsonc:231`, `LodgingReview.jsonc:36`. Split
public/private schema fields.

### 9. URL fields need protocol/domain validation
Database/admin-entered URLs flow into `href`, `window.open`, and newsletter
HTML: `PartnerProfile.jsx:67`, `RestaurantCard.jsx:152`,
`NewsletterBuilder.jsx:85`. Add a shared URL sanitizer allowing only `https:`,
`http:`, `mailto:`, and `tel:` as appropriate (blocks `javascript:` XSS).

### 10. Dependency audit is failing
`npm audit --omit=dev` reports 10 prod vulns (1 critical, 4 high, 5 moderate).
Direct affected deps include `jspdf`, `lodash`, `postcss`, `react-router-dom`:
`package.json:59`. `npm ls` also shows `sdk@0.8.36` invalid against range
`^0.8.37` (Base44 package-bump churn). Re-run `npm audit fix`.

---

## Checks at audit time

- **Build:** passes when run outside sandbox.
- **Metrics:** 122 pages, 86 entities, 23 functions, 317 JS chunks, 388 KB
  entry JS, 2.77 MB total JS. (Matches our `APP_WEIGHT_LOG.md` row.)
- **Lint:** fails — 150 unused-import errors.
- **Typecheck:** fails broadly due to JS/JSX config + dependency-checking noise.
- **Secrets sweep:** clean — no committed `.env`, private key, or live API key.

---

## Remediation order (as recommended by the auditor)

1. Lock down automation + notification functions with signed automation auth;
   fail closed. (Findings #1, #2)
2. Remove all browser `asServiceRole`; use targeted server functions or
   hardened `admin-ops`. (Finding #3)
3. Add idempotency, rate limits, and transactional/reconciliation logic to
   booking, order, sync, and notification paths. (Findings #4, #6)
4. Split public/private schema fields and sanitize all outbound URLs.
   (Findings #8, #9)
5. Update vulnerable deps; make build/lint/audit/typecheck meaningful CI gates.
   (Findings #7, #10)
