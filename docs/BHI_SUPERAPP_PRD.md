# BHI SuperApp Product Requirements Document

Version: 0.3
Date: July 8, 2026
Status: Living document — reconciled against the shipped codebase at commit `d794cf2`
Repository: bhi-superapp
Supersedes: v0.2 (July 8, 2026), v0.1 (May 6, 2026)

---

## 0. Reconciliation Note (document history)

**v0.1 (May 6)** was a "don't ship the transaction prototype" plan: launch
informational-only, defer all payments to a contract-gated Phase 3, rebuild on
Postgres/Next.js, and monetize via a paid Wildlife/Nature Mode.

**v0.2 (Jul 8)** reconciled the document to reality: the team had instead built
a live transactional super-app on Base44 — ~10 verticals with payments and
commission, a BHI Concierge membership, and a live-data core (ferry, weather,
LLM-assisted events). v0.2 documented *what the app is* and where the risks are.

**v0.3 (this version)** adds *what company is being built*. v0.2 described the
product accurately but under-described the business: it read like "an app for
Bald Head Island" rather than "the operating platform for premium destination
communities." v0.3 reframes around that platform thesis, decomposes the app into
reusable primitives, adds the proprietary-data moat, KPIs, an AI roadmap, a
multi-island expansion strategy, engineering guardrails, and a three-track
roadmap. The honest reconciliation and the still-binding normative content
(wildlife safety, trust/freshness, privacy, security posture) carry forward
unchanged.

The v0.1 → v0.2 divergence table (what was planned vs. what shipped) is retained
in git history at v0.2; it is not repeated here.

---

## 1. Executive Summary

Bald Head Island is not the product. **Bald Head Island is the laboratory.**

What is being built is the **operating platform for premium destination
communities** — resort islands and affluent seasonal towns (Kiawah, Sea Island,
Nantucket, Martha's Vineyard, Hilton Head, the Hamptons) that share the same
structural needs: transient high-expectation visitors, a constrained
arrival/logistics chokepoint, a seasonal local economy, and a service ecosystem
that is currently coordinated by phone calls, PDFs, and word of mouth.

The current deployment — BHI SuperApp, a mobile-first Vite/React PWA on Base44 —
proves the model on one island. It combines a **daily island-intelligence layer**
(live ferry tracking, weather/marine conditions, an LLM-assisted event calendar,
alerts) with a **transactional services marketplace** spanning ~10 verticals
(ferry, rentals, dining, babysitting, mainland shopping, events/weddings,
concierge, fishing, lodging, community). It takes real payment through a
tokenized Wix checkout, records platform commission in a `RevenueEntry` ledger,
and sells a premium **BHI Concierge membership** ($19/mo · $199/yr, 7-day trial).

The strategic insight of v0.3: those ten verticals are not ten products. They
are five reusable **platform primitives** — Identity, Places, Things,
Marketplace, and Intelligence (§3) — configured for one island. If the second
island can be launched by **configuration and partner onboarding rather than
months of new code**, the company has built a scalable platform, not a bespoke
app. That is the milestone that materially changes enterprise value.

The near-term mandate is therefore threefold and is explicitly **not** "ship more
features": (1) complete production hardening, (2) prove the operating model has
real partners and support behind every paid vertical, and (3) begin extracting
reusable platform modules. See the three-track roadmap (§18) and the
feature-freeze recommendation (§25).

## 2. Platform Vision — From App to Operating System

### The reframe

The product should stop being described as "an app for Bald Head." It is the
**configurable operating system for a destination community**. The working
platform name is **Compass** (proposed; the per-island consumer brand can differ,
e.g. "BHI SuperApp" / "BHI Concierge" for the first deployment).

- **Today's framing (too small):** *Here's an app for Bald Head Island.*
- **v0.3 framing (the real company):** *We build the operating platform that runs
  premium destination communities — starting with Bald Head Island.*

### Why the platform thesis is credible

Every destination community re-solves the same problems badly. The intelligence
layer (how do I get there, what's open, what's happening) and the marketplace
layer (book the sitter, order dinner, reserve the rental, request the concierge)
are structurally identical across islands; only the **local data, partners, maps,
and branding** change. That is the definition of a multi-tenant platform, and it
is why the roadmap (§18) prioritizes extracting modules over adding verticals.

### The bet

The company is de-risking a single hypothesis: *the second island launches by
configuration, not construction.* Everything in the hardening and platformization
tracks serves that bet.

## 3. Platform Primitives

The ~90 pages and 86 entities reduce to **five primitives**. This is the most
important architectural framing in the document: future work should be described
and built as primitives, with verticals as configurations of them.

### 3.1 Identity
Residents, visitors, guests, businesses, service providers, admins. One
role/tier model, one onboarding, one permission system, one CRM.
*Today:* `User`, `UserPreference`, `UserActionLog`, `UserBlock`, `Membership`,
role/tier onboarding, `RelationshipCRM`, provider identities
(`Babysitter`/`BirdieShopper`/`ConciergeProvider`/`FishingCharter`/`EventVendor`)
with `*PrivateInfo` PII separation.

### 3.2 Places
Restaurants, homes, shops, marinas, docks, rental properties, vendors,
landmarks, beach accesses. One geo/directory/verification model.
*Today:* `Restaurant`, `Shop`, `Lodging`, `RentalProperty`, `BusinessPin`,
`FishingSpot`, `ParkingSpot`, `RealEstateAgent`, `BuilderHomeService`,
`CommunityPartner`, map/directory surfaces.

### 3.3 Things
Events, reservations, bookings, orders, alerts, tickets, memberships,
notifications — the transactable/subscribable objects.
*Today:* `IslandEvent`, `FerryBooking`, `RentalBooking`, `FoodOrder`/`OrderItem`,
`LodgingBooking`, `BabysitterBooking`, `BirdieRequest`, `ParkingReservation`,
`PushNotification`, `SavedEvent`/`SavedCaptain`/`SavedBabysitter`.

### 3.4 Marketplace
Providers ↔ customers, payments, availability, reviews, CRM, referrals,
commissions. One commerce engine.
*Today:* `create-checkout` + Wix + webhook, `book-ferry`/`book-rental`/
`place-food-order`, `RevenueEntry`, `PreferredPartner`/`PartnerReferralEvent`/
`ReferralInquiry`, `Sponsorship`/`AdCampaign`, review entities, availability
entities.

### 3.5 Intelligence
Weather, ferries, calendar, notifications, AI, recommendations, routing — the
live-data and decision layer.
*Today:* `fetch-weather`/`getBHIWeatherMarineStatus`, ferry tracking + `sync-*`
functions, event ingestion (`EventSource`, `sync-island-events`,
`analyze-event-source`), `Agents`/`AgentChat`, `SyncLog`.

> **Directive:** New capability should be built as an enhancement to a primitive
> ("Marketplace Module v1 gains deposits"), not as a new island-specific product
> ("Bald Head Kayak Rentals"). See Engineering Guardrails (§20).

## 4. Product Positioning

Internal/platform name: **Compass** (proposed). Per-island consumer brand for the
first deployment: **BHI SuperApp** internally, **BHI Concierge** for the premium
tier. v0.1's caution holds — lead *consumer* surfaces with "trusted, calm,
concierge-grade," reserve "SuperApp/platform/OS" for internal and investor
framing.

**Product promise:** The trusted way to plan, move around, and get things done on
Bald Head Island — and, at the company level, the platform that makes that true
for any destination community.

**Quality bar (unchanged, still the north star):** Accurate · Current · Quietly
premium · Non-gimmicky · Privacy-aware · Locally respectful · Operationally
reliable. Because the app takes real money, "operationally reliable" is a launch
gate, not an aspiration.

## 5. Strategic Rationale

### The pivot, and why it is defensible
v0.1 warned a transaction-heavy launch risks user, partner, safety, and legal
trust. That warning still holds — but the team has been retiring the risk rather
than the transactions: server-side pricing for ferry/rental/food, tokenized
card handling (PCI scope minimized), a fail-closed payment webhook, entity RLS,
and audit logs (`UserActionLog`/`RevenueEntry`/`SyncLog`).

### What still must be true
1. **Every paid vertical needs a real fulfillment path** — a named operator, an
   acceptance step, a cancellation/refund policy, a support contact — or it
   reverts to lead-gen.
2. **The remaining v0.1 P0 anti-patterns must go:** client-side
   `ParkingReservation.create` and the fabricated "92% confidence" ETA still
   ship and contradict the trust bar.
3. **The security findings must close** before any paid marketing push
   (`docs/SECURITY_AUDIT_2026-07-08_codex.md`).

## 6. Goals

**Product:** daily-habit island dashboard; low-anxiety logistics; dependable,
well-supported booking in verticals with real operators; wildlife/conservation
education without unsafe proximity.
**Business:** grow commission GMV in genuinely-partnered verticals; grow
membership conversion/retention; activate the listing/sponsorship/attribution
inventory already built; **prove multi-island repeatability**.
**Engineering:** close audit P0/P1; add idempotency/capacity/reconciliation to
transactional paths; hold entry-bundle weight (`APP_WEIGHT_LOG.md`); keep
source+freshness metadata on all live data; **extract reusable primitive
modules**.

## 7. Non-Goals

Will not: take payment in a vertical lacking operator + acceptance + support;
sell ferry/tram/parking transactions without a BHI Transportation integration;
show exact locations for sensitive wildlife or sell coordinates; present
estimates as fact; replace official Village/Transportation/Conservancy channels;
ship native mobile before PWA retention is proven; **fork the codebase per
island** (multi-tenant configuration only — §19).

## 8. Users and Personas

Retained from v0.1/v0.2: First-Time Visitor, Repeat Guest, Homeowner/Resident,
Property Manager, Local Business, Contractor, Naturalist/Conservancy Partner,
Admin/Operator. Marketplace-supply personas the app actually shipped: service
providers (sitters, Birdie shoppers, captains, concierge providers, event
vendors — with onboarding, approval status, background-check/private-info
handling), premium members, and event hosts. At the platform level, add the
**Island Operator** persona: the local team that runs a Compass deployment
(onboards partners, handles fulfillment/support, moderates) — see Track 2 (§18).

## 9. Feature Catalog (as built)

Organized into lazy-loaded shells; **[$]** = takes payment / records commission,
**[live]** = consumes live/synced data. Each maps onto a primitive (§3).

- **Daily Intelligence** [live]: Today Dashboard; Weather & Marine
  (`fetch-weather`, `getBHIWeatherMarineStatus`); Ferry Status & Tracking
  (`FerryVessel`/`FerryStatus`/`sync-ferry-status`); Island Calendar/Events
  (LLM ingestion pipeline); Alerts & Push.
- **Getting Here & Around**: Ferry hub/schedule/ETA/map/route; Book Ferry [$];
  Ferry Parking (⚠️ still client-side `ParkingReservation.create`);
  Transportation & Parking, Car Locator, Valet Waitlist.
- **Marketplace & Services**: Equipment Rentals [$]; Dining/Food Orders [$];
  Lodging [$]; Babysitting [$] (full marketplace w/ reviews, messaging, safety
  check-ins, background-check status, private-info separation); Birdie mainland
  shopping [$]; Fishing Charters; Concierge Services; Events & Weddings; Shops &
  Island Retail.
- **Community & Content**: Community Feed (posts/comments/submissions, LLM
  moderation, reporting, blocks); AI Agents (`AgentChat`, logistics assistant).
- **Wildlife & Conservation**: Turtle Education & Nest Map
  (`TurtleNest`, `sendTurtleHatchingAlert`). *The paid Nature Mode and
  sensitivity-tiered sightings model was not built — see §14.*
- **Membership & Monetization**: BHI Concierge Membership [$]; Founders; upgrade
  prompts; Sponsorship/Ads/Partner/CRM/Referral infrastructure.
- **Accounts, Trip Planning, Admin**: role/tier onboarding, profile/settings,
  saved items; My Plans/Trip Planner (`PlanItem`); 22 role-gated admin consoles
  with generic service-role CRUD centralized in `admin-ops`.

## 10. Functional Requirements (normative, current)

v0.1 acceptance criteria for informational surfaces remain in force and are not
repeated. Changed-because-we-transact requirements:

**10.1 Transactional verticals** must: price server-side from trusted data
(never trust client price/qty/commission); verify availability/capacity and
decrement atomically or reconcile; use idempotency keys; have an operator
acceptance step before "Confirmed"; expose cancellation/refund terms + support
in-flow; record revenue via service role only. *Gaps: non-atomic writes and
missing idempotency (audit #6); price-verification parity unconfirmed for
babysitting/lodging/birdie.*

**10.2 Parking** — remove client `ParkingReservation.create`; informational +
official-link handoff until an operator integration exists (v0.1 P0, open).

**10.3 ETA** — remove fabricated "92% confidence"; show estimated ranges unless a
validated routing model exists (v0.1 P0, open).

**10.4 Automation/sync functions** must fail closed on missing auth and require a
signed automation secret/identity; treating `auth.me()` failure as permission to
run is prohibited (audit #1, #2).

**10.5 Community integrity** — likes/comments/reports backed by per-user rows,
counts derived (audit #5).

## 11. Monetization

**Live today:** (1) transaction commissions (`RevenueEntry`: ferry/rental/lodging
commission, food platform fee) — the primary realized mechanic; (2) BHI Concierge
membership ($19/mo · $199/yr, 7-day trial).
**Built, not yet activated:** (3) enhanced listings & sponsored placement
(`Sponsorship`/`AdCampaign`/`PreferredPartner` schemas + admin tooling exist —
packaging/pricing/sales missing); (4) partner lead attribution
(`PartnerReferralEvent`/`ReferralInquiry`/`RelationshipCRM`).
**Deferred/decision-required:** (5) paid Wildlife/Nature Mode — not built (§14).
**Platform-tier (future):** per-island SaaS/licensing + revenue share once
multi-tenant (§19) — the highest-margin line and the reason the platform thesis
matters.

## 12. Proprietary Data Assets (the Moat)

The moat is **not features** — every feature is copyable. The moat is the
**longitudinal, island-specific dataset** no competitor can retro-actively
acquire. Two years of operation yields a proprietary record of: every ferry
departure and delay; every weather/marine event; every business, its hours and
seasonality; every rental and its demand curve; every concierge/Birdie request;
every restaurant wait and order; every event and its attendance; every parking
event; every charter and catch; every provider and their reliability; every
visitor trend, membership, referral, and review.

**Why it compounds:**
- **Recommendations & routing** improve with density (best ferry to make a
  dinner reservation given tonight's marine forecast).
- **AI** (§13) grounds on proprietary island data competitors lack.
- **Partners** gain analytics (demand curves, lead attribution) that make the
  platform sticky and sellable.
- **New-island cold-start** shrinks: the model of "how a destination community
  behaves" transfers even when the local data doesn't.

**Requirements:** define the canonical proprietary datasets and their schemas;
protect them (access control, export gating, no leakage via public RLS — audit
#8); make freshness/lineage explicit; and treat aggregate/anonymized island
analytics as a product surface, never selling individual PII or sensitive
wildlife coordinates.

## 13. AI Roadmap

Agent infrastructure exists (`Agents`/`AgentChat`) but lacks a stated evolution.
Define one so engineers and investors see the arc:

- **Phase 1 — Information assistant** *(≈today):* answers island questions
  (ferry, hours, weather, events) grounded on live/proprietary data.
- **Phase 2 — Trip planner:** assembles multi-step plans (arrival → parking →
  ferry → dinner) using conditions and availability.
- **Phase 3 — Booking assistant:** executes across the Marketplace primitive
  (books the sitter, orders dinner, reserves the rental) with server-authoritative
  guardrails and human-confirmable actions.
- **Phase 4 — Island concierge:** proactive, personalized, membership-grade
  ("your ferry is delayed; I moved your dinner to 8:15 and told the sitter").
- **Phase 5 — Autonomous operations:** assists the Island Operator side —
  triaging requests, drafting responses, flagging fulfillment risk, balancing
  provider load.

Each phase must inherit the transaction-trust and safety rules (§10, §16); AI may
never confirm what the server has not.

## 14. Open Decision — Wildlife/Nature Mode

v0.1's signature paid Nature Mode was not built; the app shipped turtle education
+ nest map only. Choose explicitly: **(a) invest** (sensitivity-tiered,
coordinate-free sightings with BHI Conservancy partnership + revenue share),
**(b) keep free** as brand/trust value, or **(c) drop** from roadmap. Whichever:
the §16 wildlife safety rules bind any wildlife content, free or paid — **sell
context, never coordinates.**

## 15. Data Model (as built — 86 entities)

Canonical model in `base44/entities/*.jsonc`; every entity maps to a primitive
(§3). Grouped: Identity/CRM; Ferry & transport; Conditions & events; Marketplace
supply/demand (rentals, food, lodging, shops); People-service marketplaces
(babysitting, Birdie, fishing, concierge — with `*PrivateInfo` PII separation);
Events & weddings; Community; Wildlife (`TurtleNest`); Business/partner/revenue;
Misc (`AffiliateProduct`, `ShoppingRequest`, `PushNotification`). The v0.1
`WildlifeSighting` sensitivity model was never implemented; add per v0.1 field
spec (in git history) only if §14 option (a) is chosen.

## 16. Safety, Legal, and Trust Requirements

**Wildlife safety (binding, from v0.1):** no exact alligator/sea-turtle tracking;
no "navigate to animal"; no gamified sighting leaderboard; no proximity rewards;
prominent safety education; align with NC Wildlife / Village of BHI / BHI
Conservancy (§24).
**Transaction trust (load-bearing):** no "Confirmed" without a server/operator-
backed record; no payment state trusted pre-webhook; no client-side inventory
reduction; no ticket/QR without official validity.
**Privacy:** provider PII stays in `*PrivateInfo` with restricted RLS; public
records must not leak `owner_email`/`commission_rate`/`subscription_status`/
internal notes/reviewer emails (audit #8); admin exports and `downloadUserData`
remain access-controlled and self-scoped.
**Security posture:** tracked in `docs/SECURITY_AUDIT_2026-07-08_codex.md`;
closing P0/P1 is a launch gate for paid marketing.

## 17. UX & Copy Principles

Unchanged and binding. Use "Official booking," "Planned ferry," "Last updated,"
"Verified," "Approximate area," "Observe from a safe distance." Avoid "Confirmed"
(unless source-backed), "Real-time animal location," "92% confidence" (currently
violated in FerryETA), "Guaranteed availability."

## 18. Roadmap — Three Parallel Tracks

The phase model is retired; the product already operates at "Phase 2/3." Run
three tracks in parallel, with Track 1 consuming almost all *engineering* effort
for the next ~month (see the feature-freeze recommendation, §25).

### Track 1 — Production Readiness *(launch gate)*
Security (close audit P0/P1: automation auth fail-closed, remove browser
`asServiceRole`), monitoring, logging, performance/bundle budget, backups,
testing, RLS coverage, disaster recovery. Also remove client
`ParkingReservation.create` and the "92% confidence" ETA; add idempotency +
capacity + reconciliation to booking/order/sync; resolve `npm audit`; restore
lint/typecheck gates.
*Exit:* no request can alter a charge; no endpoint runs unauthenticated; audit
P0/P1 closed; recoverable and observable.

### Track 2 — Partner Operations *(the real bottleneck — not engineering)*
The binding constraint is operational, not technical. Who answers concierge
requests? Who refunds bookings? Who approves babysitters and verifies vendors?
Who moderates content and handles chargebacks? Who responds at 9 PM? Each paid
vertical needs an identified fulfillment owner and a documented operational
playbook, or it reverts to lead-gen. This track gets its own roadmap and staffing
plan and is the true gate on scaling.
*Exit:* every checkout vertical is genuinely supportable; no flow implies a
partnership that doesn't exist.

### Track 3 — Platformization *(where the enterprise value lives)*
Extract island-specific features into reusable primitive modules:
- "Bald Head Babysitting" → **Marketplace Module v1**
- "Events" → **Booking Engine**
- "Restaurant Ordering" → **Commerce Module**
- "Membership" → **Subscription Platform**
- Intelligence sync/AI → **Intelligence Module**
Introduce a tenant/config layer (branding, partners, maps, local data as
configuration).
*Exit:* the second island can be stood up by configuration + partner onboarding,
not new development (§19).

## 19. Multi-Island Expansion

**Compass is designed as a multi-tenant platform.** Proposed launch sequence:
1. Bald Head Island *(live — the laboratory)*
2. Kiawah Island
3. Sea Island
4. Nantucket
5. Martha's Vineyard
6. The Hamptons

**Shared across every deployment (the platform):** marketplace engine, CRM,
booking/commerce, membership/subscriptions, events, notifications, AI,
analytics, intelligence sync.
**Per-island configuration only:** branding, partners, maps, local data, and
which verticals are enabled.

This is a materially stronger story than "copy the app per island." The
company's key milestone is deployment #2 launching by configuration — that is the
proof of a scalable platform and the inflection in long-term value.

## 20. Engineering Guardrails

Every future feature must satisfy these before merge (extends the code-splitting/
weight discipline in `APP_WEIGHT_LOG.md`):

- **No increase in JS entry bundle beyond budget** (target ≤ 500 KB; currently
  ~388 KB).
- **Every new route lazy-loaded.**
- **Every new transaction server-authoritative** (no client-trusted price/qty/
  inventory/confirmation).
- **Every new entity ships with RLS and an audit trail.**
- **Every new automation is idempotent** and fails closed on missing auth.
- **Every external data source exposes freshness metadata.**
- **Every new vertical has an identified fulfillment owner and a documented
  operational playbook** (ties Track 2 to code review).
- **Every new capability is built as a primitive/module enhancement, not an
  island-specific product** (§3).

These are the debt brakes that keep platformization from regressing as the app
grows.

## 21. Success Metrics & KPI Dashboard

v0.2 lacked measurable targets. Define the operating dashboard:

**Daily Intelligence:** DAU/WAU, returning-user rate, ferry-page opens, weather/
conditions views, notification opt-in rate.
**Marketplace:** GMV and commission by vertical, booking conversion, revenue per
visitor, repeat-booking rate, **booking-to-fulfillment rate** (did a human
service it?), refund/dispute rate, double-booking incidents (→ 0 after Track 1).
**Membership:** trial-to-paid conversion, churn, ARPU, LTV, monthly/annual mix.
**Partner/Operations:** active vendors, fulfillment time, acceptance rate,
support contacts per active user, time-to-first-response.
**Platform/Reliability:** API/app uptime, page load, booking success rate, sync
freshness and failed-sync %, open audit findings by severity and time-to-close.
**Platform-thesis (the decisive one):** time-and-cost to stand up island #2;
% of island #2 delivered by configuration vs. new code.

Retain v0.1's wildlife-safety metrics for any wildlife content.

## 22. Engineering Backlog (reconciled)

**P0 (from the Codex audit):** automation/notification endpoints — signed auth,
fail closed; remove browser `asServiceRole` (EventsAdmin, PartnersAdmin,
BabysittingAdmin); remove client `ParkingReservation.create` and "92% confidence"
ETA.
**P1:** idempotency + capacity + reconciliation on booking/order/sync; harden
`admin-ops` (per-entity field/op allowlists, audit log); back community counters
with per-user rows; server-side price-verification audit across *all* paid
verticals.
**P2:** split public/private schema fields + shared outbound-URL sanitizer
(https/http/mailto/tel); resolve `npm audit`; fix ~150 unused-import lint errors
+ typecheck config; SEO/metadata/manifest/robots; privacy policy + terms
(mandatory given payments and children's-service data); hold entry-bundle weight.
**Platformization (Track 3):** tenant/config layer; extract Marketplace, Booking,
Commerce, Subscription, and Intelligence modules.

## 23. Open Questions

- Which paid verticals have **real contracted operators today** vs. checkout
  flows without a supported back end?
- Can BHI Transportation provide a schedule/status API or sanctioned deep-links?
- Will BHI Development Corp treat this as unofficial companion, official partner,
  or white-label service?
- Nature Mode: invest, keep-free, or drop (§14)?
- Does babysitting's handling of minors' logistics and provider background checks
  meet the legal/insurance bar for a paid marketplace?
- What is the Island Operator staffing model behind the marketplace at scale
  (Track 2)?
- **Which island is #2, and what is the target "configuration-only" launch cost?**
- What is the platform's commercial model per island (SaaS license, revenue
  share, JV with a local operator)?

## 24. Source References

- NC Wildlife Resources Commission alligator coexistence guidance:
  https://www.ncwildlife.gov/news/press-releases/2023/05/12/wildlife-commission-provides-tips-coexist-alligators
- NC Wildlife alligator species and safety page: https://www.ncwildlife.gov/alligator
- Village of Bald Head Island alligator guidance:
  https://villagebhi.org/visitors/learn-about-island-wildlife/alligators/
- Bald Head Island Conservancy wildlife safety: https://bhic.org/learn/wildlife-safety/
- Bald Head Island Transportation ferry and tram reservations:
  https://www.baldheadislandferry.com/tram/
- Internal: `docs/SECURITY_AUDIT_2026-07-08_codex.md`, `docs/APP_WEIGHT_LOG.md`

## 25. Product Decision Summary

The product is not a prototype to salvage, and — as of v0.3 — not merely a
super-app to harden. It is the **first deployment of a multi-island operating
platform.** The strategic task:

1. **Freeze feature development for ~1 month.** Direct almost all engineering to
   (a) production hardening (Track 1), (b) validating the operating model — real
   partners, fulfillment, support for every existing vertical (Track 2), and (c)
   extracting reusable platform modules (Track 3).
2. **Make breadth honest.** Every paid vertical needs a real operator and support
   path, or it becomes lead-gen. Depth beats breadth now.
3. **Protect and productize the moat.** The proprietary island dataset (§12), not
   the feature list, is the durable advantage — protect it and turn it into
   recommendations, AI grounding, and partner analytics.
4. **Prepare for island #2.** The decisive milestone is not the next feature — it
   is standing up the second community by **configuration and partner onboarding,
   not months of new code.** That is what proves a scalable platform and
   materially changes the company's value.
5. **Decide the wildlife story** (§14) and the AI arc (§13) deliberately, not by
   default.

The live-data core is the daily-habit differentiator (protect it, prove it
trustworthy). The marketplace is the revenue engine (make it safe and
supportable). The primitives are the company (extract and generalize them). Bald
Head Island is the laboratory — the goal is the platform.
