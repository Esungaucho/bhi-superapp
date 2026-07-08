# BHI SuperApp Product Requirements Document

Version: 0.2
Date: July 8, 2026
Status: Living document — reconciled against the shipped codebase at commit `b058e41`
Repository: bhi-superapp
Supersedes: v0.1 (May 6, 2026)

---

## 0. Reconciliation Note (what changed since v0.1)

**v0.1 was a "don't ship the transaction prototype" document.** It recommended
launching an informational-only companion, deferring all transactions to a
Phase 3 that required signed partner agreements, a Postgres/Next.js backend, and
payment infrastructure. Its signature monetization idea was a paid
Wildlife/Nature Mode subscription.

**The product went the other way.** Between May and July 2026 the team built a
full transactional island super-app on Base44: live payments, commission
tracking, and ~10 service verticals. This v0.2 documents the product **as it
actually exists**, keeps the v1 guidance that is still correct (wildlife
safety, data-freshness labeling, privacy, trust copy, RBAC/audit), and retires
the guidance that reality has overtaken.

Key divergences from v0.1, stated plainly so nobody plans against a stale map:

| v0.1 said | Reality at `b058e41` |
|-----------|----------------------|
| Do **not** sell inside the app; defer to Phase 3 | Live payments via Wix tokenized checkout; ferry/rental/food/babysitting/lodging booking flows shipped |
| Monetize via listings, sponsorships, guest guides, paid Nature Mode | Monetizing via **commissions** (`RevenueEntry`) + a **$19/mo · $199/yr "BHI Concierge" membership**; listings/sponsorship infra exists but Nature Mode was never built |
| ~11 informational screens | 90+ pages, 86 entities, 23 backend functions, 22 admin consoles |
| Move off Base44 to Postgres/Next.js for production | Still 100% Base44 + Vite/React SPA |
| Remove client-side ferry booking, parking reservation, fake ETA confidence (P0) | Booking moved server-side ✅, **but** `FerryParking.jsx` still does `ParkingReservation.create` client-side and `FerryETA.jsx` still shows "92% confidence" ❌ |

The strategic question v0.2 forces is no longer "should we add transactions?"
It's **"we have a broad, live, transaction-heavy super-app — how do we make it
trustworthy, operationally supportable, and defensible?"** Depth of support and
partner legitimacy now matter more than breadth of features.

---

## 1. Executive Summary

BHI SuperApp is a mobile-first web application (Vite/React PWA on Base44) that
serves Bald Head Island residents, homeowners, rental guests, and visitors as
both a **daily island-intelligence layer** and a **transactional services
marketplace**. It combines live operational data (ferry tracking, weather and
marine conditions, an LLM-assisted island event calendar) with booking and
ordering across roughly ten verticals: ferry, equipment rentals, dining,
babysitting, mainland personal shopping ("Birdie"), events and weddings,
concierge services, fishing charters, lodging, and a community feed.

The app takes payment today through a tokenized Wix checkout (no card data
touches our systems — PCI scope is minimized) and records platform commissions
in a `RevenueEntry` ledger. A premium **BHI Concierge membership** ($19/month or
$199/year, 7-day free trial) layers subscription revenue on top.

The product's strengths are breadth and a genuinely useful live-data core. Its
risks are the natural consequences of building a marketplace fast on a
prototyping platform: **authorization and automation-endpoint security**
(documented in `SECURITY_AUDIT_2026-07-08_codex.md`), **operational support
depth** (bookings can be created faster than a human can service them), and
**partner legitimacy** (several flows imply operator relationships that must be
real before scale).

The near-term mandate is to **harden and legitimize what exists** rather than
add verticals: close the security findings, ensure every booking/order vertical
has a real fulfillment and support path, and label every piece of operational
data with its source and freshness.

## 2. Product Positioning

### Name

The app ships as **BHI SuperApp** internally; the premium tier is branded **BHI
Concierge**. v0.1's caution against the "SuperApp" label in *public consumer*
positioning still holds — residents and affluent visitors respond to "trusted,
calm, concierge-grade," not "everything app." Recommend keeping "SuperApp" as
the internal/investor name and leading consumer-facing surfaces with a calmer
promise.

### Product Promise

The trusted way to plan, move around, and get things done on Bald Head Island.

### Target Quality Bar (unchanged from v0.1 — still the north star)

Accurate · Current · Quietly premium · Non-gimmicky · Privacy-aware · Locally
respectful · Operationally reliable.

The product must not feel like a coupon app, a fake marketplace, or a
speculative AI demo. Given that it now takes real money, "operationally
reliable" is no longer aspirational — it is a launch gate.

## 3. Strategic Rationale

### The pivot, and why it is defensible

v0.1 warned that a transaction-heavy launch "risks user trust, partner trust,
public safety, and legal exposure." That warning is still correct — but the
team has been retiring the risk rather than the transactions:

- **Payment integrity:** pricing for ferry, rental, and food orders is now
  computed server-side from trusted entity data, not client input (see the
  July security work and `SECURITY_AUDIT_2026-07-08_codex.md` finding #6). Card
  data is tokenized through Wix; the payment webhook verifies its JWT and fails
  closed.
- **Access control:** entity-level RLS is present across the data model; admin
  routes are role-gated at the shell.
- **Auditability:** `UserActionLog`, `RevenueEntry`, and `SyncLog` exist.

### What still has to be true for the pivot to hold

1. **Every vertical that takes money must have a real fulfillment path** — a
   named operator/provider, an acceptance step, a cancellation/refund policy,
   and a support contact. Verticals that cannot meet this bar should be reverted
   to lead-gen ("request info," "official booking") rather than checkout.
2. **The remaining v0.1 P0 anti-patterns must go:** client-side
   `ParkingReservation.create` and the fabricated "92% confidence" ETA both
   still ship and directly contradict the trust bar.
3. **The security findings must be closed** before any paid marketing push.

### Trust Ladder (retained, re-anchored to today)

The app has jumped to rung 5 for several verticals. The work now is to
*retroactively satisfy* rungs 2–4 (verified data, real lead handoff, human
confirmation) underneath the transactions already built.

## 4. Goals

### Product Goals

- Be the daily-habit island dashboard (ferry status, weather/marine, alerts,
  events) for residents and homeowners.
- Make island logistics — arrival, ferry, tram, parking, luggage, departure —
  low-anxiety for first-time and repeat visitors.
- Provide dependable, well-supported booking/ordering in the verticals where a
  real operator relationship exists.
- Educate about island wildlife and conservation without encouraging unsafe
  proximity or crowding.

### Business Goals

- Grow commission GMV in verticals with genuine operator partnerships.
- Grow BHI Concierge membership conversion and retention.
- Build sellable partner inventory (enhanced listings, sponsored placement) on
  top of the existing directory.
- Establish credibility with BHI Development Corp, BHI Transportation, BHI
  Conservancy, Village of BHI, property managers, and merchants.

### Engineering Goals

- Close the P0/P1 items in `SECURITY_AUDIT_2026-07-08_codex.md` (automation-
  endpoint auth, browser-side service-role removal, dependency audit).
- Add idempotency, capacity checks, and reconciliation to booking/order/sync
  paths.
- Keep first-load weight in check (see `APP_WEIGHT_LOG.md`; entry JS held at
  ~388 KB post code-splitting) as features grow.
- Maintain source + freshness metadata on all operational data.

## 5. Non-Goals

The product will **not**:

- Take payment in a vertical that lacks a real operator, acceptance step, and
  support/refund path. (If it can't be supported, it's lead-gen, not checkout.)
- Sell ferry, tram, or parking transactions without an explicit BHI
  Transportation integration. (Informational + official-link handoff only.)
- Display exact real-time locations for sensitive wildlife, or sell coordinates.
- Present unofficial estimates (ETA, availability) as authoritative fact.
- Replace official BHI Transportation, Village of BHI, or BHI Conservancy
  channels.
- Ship a native mobile app before validating PWA retention.

## 6. Users and Personas

Retained from v0.1 (First-Time Visitor, Repeat Vacation Guest, Homeowner/
Resident, Property Manager, Local Business, Contractor/Service Provider,
Naturalist/Conservancy Partner, Admin/Operator). Personas added by verticals the
app actually shipped:

- **Service provider (marketplace supply):** babysitters, personal shoppers
  ("Birdie" shoppers), fishing captains, concierge providers, event vendors —
  each has onboarding, approval status, and in some cases background-check and
  private-info handling (`BabysitterPrivateInfo`, `BirdieShopperPrivateInfo`).
- **Premium member:** a resident/frequent visitor paying for BHI Concierge.
- **Event host:** planning a wedding or gathering via the events vertical
  (`EventPlan`, `EventVendor`, `EventGuest`, `EventTimelineItem`).

## 7. Product Concept — Feature Catalog (as built)

The app is organized into shells (navigation areas), each lazy-loaded. Verticals
marked **[$]** take payment or record commission today; **[live]** consume live
external/synced data.

### 7.1 Daily Intelligence

- **Today Dashboard** — entry surface; conditions, ferry, alerts, discovery.
- **Weather & Marine** **[live]** — `fetch-weather`, `getBHIWeatherMarineStatus`;
  temperature, wind, tide, marine status, beach conditions.
- **Ferry Status & Tracking** **[live]** — `FerryVessel`, `FerryStatus`,
  `FerryAnnouncement`, `sync-ferry-status`; tracker map, departure list, alerts.
- **Island Calendar / Events** **[live]** — LLM-assisted ingestion pipeline
  (`EventSource`, `sync-island-events`, `sync-all-island-events`,
  `sync-old-baldy-events`, `analyze-event-source`); search, filter, saved events.
- **Alerts & Push Notifications** — `PushNotification`, opt-in permission prompt,
  ferry/event notification functions.

### 7.2 Getting Here & Around

- **Ferry & Tram Hub / Schedule / ETA / Map / Route detail.**
- **Book Ferry** **[$]** — `book-ferry`, commission recorded.
- **Ferry Parking** — ⚠️ still creates `ParkingReservation` client-side (v0.1 P0,
  unresolved).
- **Transportation & Parking, Car Locator, Valet Waitlist** — `ParkingSpot`,
  `ValetWaitlist`.

### 7.3 Marketplace & Services

- **Equipment Rentals** **[$]** — `book-rental`, server-side pricing, inventory
  decrement, commission.
- **Dining / Food Orders** **[$]** — `place-food-order`, `MenuItem`, `OrderItem`,
  fulfillment types (pickup/delivery/dine-in) with tiered commission.
- **Lodging** **[$]** — `Lodging`, `LodgingBooking`, `LodgingReview`.
- **Babysitting** **[$]** — full marketplace: `Babysitter`, `BabysitterBooking`,
  reviews, in-app messaging, safety check-ins, background-check status, private
  info separation. Payment via `create-checkout`.
- **Birdie (mainland personal shopping)** **[$]** — `BirdieShopper`,
  `BirdieRequest`, tracking events, shopper private info.
- **Fishing Charters** — `FishingCharter`, `FishingSpot`, `CaptainAvailability`,
  `CaptainCatch`, captain dashboard, availability notifications.
- **Concierge Services** — `ConciergeProvider`, `ConciergeRequest`, provider
  dashboard, tracking.
- **Events & Weddings** — `EventPlan`, `EventVendor`, `EventQuoteRequest`,
  `EventConciergeRequest`, `WeddingInquiry`, guest logistics, timeline, rentals.
- **Shops & Island Retail** — `Shop`, `Product`, `IslandShopProduct`,
  `PromoDeal`, marketplace + directory.

### 7.4 Community & Content

- **Community Feed** — `CommunityPost`, `CommunityComment`, `CommunitySubmission`,
  moderation (`moderateCommunityPost`, `reviewSubmission` with LLM scoring),
  reporting, user blocks/status.
- **AI Agents** — `Agents`, `AgentChat`, `LogisticsAgent` (island Q&A/assistance).

### 7.5 Wildlife & Conservation

- **Turtle Education & Nest Map** — `TurtleNest`, `sendTurtleHatchingAlert`.
  Note: this is the **education-and-awareness** slice of v0.1's wildlife vision;
  the **paid Nature Mode subscription and sensitivity-tiered sightings model was
  not built.** See §10 for the decision this leaves open.

### 7.6 Membership & Monetization Surfaces

- **BHI Concierge Membership** **[$]** — `Membership`, 7-day trial, $19/mo or
  $199/yr, premium features + notifications.
- **Founders** page, **Premium Upgrade** prompts.
- **Sponsorship / Ads / Partner** infrastructure — `Sponsorship`, `AdCampaign`,
  `PreferredPartner`, `PartnerReferralEvent`, `RelationshipCRM`,
  `ReferralInquiry`.

### 7.7 Accounts, Trip Planning, Admin

- **Accounts & onboarding** — role/tier-based onboarding wizard, profile,
  communication/privacy settings, saved items.
- **My Plans / Trip Planner** — `PlanItem` (the v0.1 "Trip Packet" concept,
  partially realized).
- **Admin Console** — 22 role-gated admin pages (revenue, CRM, sponsorships,
  partners, submissions/community moderation, events + event sources,
  newsletter, shop, birdie, concierge, babysitting, turtles, restaurants,
  notifications, ferry, referrals, rental properties). Generic service-role CRUD
  is centralized in the `admin-ops` function.

## 8. Functional Requirements (normative, current)

The v0.1 acceptance criteria for informational surfaces (Dashboard, Getting
Here, Conditions, Map/Directory, Alerts, Accounts, Admin) remain in force and
are **not** repeated here. The following are the requirements that changed
because the product now transacts.

### 8.1 Transactional Verticals (ferry, rental, food, lodging, babysitting, birdie)

Every vertical that takes payment or records commission **must**:

- Compute price server-side from trusted entity data; never trust client price,
  quantity, or commission fields. *(Met for ferry/rental/food; verify for
  babysitting/lodging/birdie.)*
- Verify availability/capacity server-side before confirming; decrement
  inventory atomically or reconcile. *(Gap: writes are non-atomic — audit #6.)*
- Use an idempotency key so retries/double-taps cannot double-charge or
  double-book. *(Gap — audit #6.)*
- Have a defined acceptance step (provider/operator confirms) before a booking
  is presented as "Confirmed."
- Expose a cancellation/refund policy and a support contact in the flow.
- Record the transaction in `RevenueEntry` via service role only.

Acceptance criteria:

- No user can alter the amount charged by manipulating the request.
- No booking displays "Confirmed" state that is not backed by a
  server/operator-confirmed record.
- Every paid vertical links to its cancellation/refund terms before payment.

### 8.2 Parking (must be de-transactionalized)

- Remove `ParkingReservation.create` from the client. Parking is informational
  + official-link handoff until an operator integration exists (this was v0.1
  P0 and remains open).

### 8.3 ETA / Planning

- Remove the fabricated "92% confidence" figure from `FerryETA`. Show
  "estimated" ranges unless a real routing model with validation exists (v0.1
  P0, remains open).

### 8.4 Automation & Sync Functions (new, security-critical)

- Notification and sync functions (`notify-ferry-alert`, `notify-new-event`,
  `sync-*`, `reviewSubmission`) **must fail closed** on missing auth and require
  a signed automation secret or Base44-native automation identity. Treating an
  `auth.me()` failure as permission to run is prohibited (audit #1, #2).

### 8.5 Community Integrity

- Likes, comments, and reports must be backed by per-user rows keyed to
  user+content, with counts derived — not free-floating incrementable counters
  (audit #5).

## 9. Monetization Requirements

### Live today

1. **Transaction commissions** — `RevenueEntry` records ferry, rental, lodging
   commissions and food-order platform fees. This is the primary realized
   revenue mechanic.
2. **BHI Concierge membership** — $19/mo or $199/yr, 7-day free trial
   (`Membership`).

### Built but not yet activated as revenue

3. **Enhanced listings & sponsored placement** — `Sponsorship`, `AdCampaign`,
   `PreferredPartner` schemas and admin tooling exist; packaging, pricing, and
   partner sales are the missing pieces.
4. **Partner lead attribution** — `PartnerReferralEvent`, `ReferralInquiry`,
   `RelationshipCRM` support this but it is not yet a sold product.

### Deferred / decision-required

5. **Paid Wildlife/Nature Mode** — v0.1's signature idea; not built. Decide
   whether to invest (see §10) or formally drop it from the roadmap.

## 10. Open Decision — Wildlife/Nature Mode

v0.1 positioned a sensitivity-tiered, conservation-partnered paid Nature Mode as
the signature differentiator. The app instead shipped turtle education + a nest
map only. Leadership should explicitly choose:

- **(a) Invest** — build the sightings model with the v0.1 safety rules
  (sensitivity levels, delayed/coarse public display, moderation, BHIC revenue
  share). High differentiation, requires BHI Conservancy partnership.
- **(b) Keep as free education** — current turtle content stays as trust/brand
  value, not a revenue line.
- **(c) Drop** — remove from roadmap and reclaim the narrative.

Whichever is chosen, the wildlife safety requirements in §12 remain binding for
any wildlife content, free or paid. **Do not sell coordinates.**

## 11. Data Model (as built — 86 entities)

The production data model lives in `base44/entities/*.jsonc`. Grouped:

- **Users & prefs:** User, UserProfile-equivalent fields on User, UserPreference,
  UserActionLog, UserBlock, Membership, NewsletterSubscription.
- **Ferry & transport:** FerryRoute, FerrySchedule, FerryStatus, FerryVessel,
  FerryAnnouncement, FerryBooking, ParkingSpot, ParkingReservation, ValetWaitlist,
  ETACalculation.
- **Conditions & events:** IslandConditions, IslandEvent, EventSource, SavedEvent,
  SyncLog.
- **Marketplace supply/demand:** RentalItem, RentalInventory, RentalBooking,
  RentalProperty, Restaurant, MenuItem, FoodOrder, OrderItem, Lodging,
  LodgingBooking, LodgingReview, Shop, Product, IslandShopProduct, PromoDeal,
  ShopSubscription.
- **People-services marketplaces:** Babysitter (+Booking, +Review, +Message,
  +SafetyCheckin, +PrivateInfo, SavedBabysitter), BirdieShopper (+Request,
  +TrackingEvent, +PrivateInfo), FishingCharter, FishingSpot, CaptainAvailability,
  CaptainCatch, CaptainAnnouncement, SavedCaptain, ConciergeProvider,
  ConciergeRequest.
- **Events & weddings:** EventPlan, EventVendor, EventGuest, EventTimelineItem,
  EventQuoteRequest, EventConciergeRequest, WeddingInquiry.
- **Community:** CommunityPost, CommunityComment, CommunitySubmission,
  CommunityReport, CommunityUserStatus, CommunityPartner.
- **Wildlife:** TurtleNest.
- **Business/partner/revenue:** RevenueEntry, Sponsorship, AdCampaign,
  PreferredPartner, PartnerReferralEvent, PartnerReview, ReferralInquiry,
  RelationshipCRM, BusinessPin, RealEstateAgent, BuilderHomeService.
- **Misc:** AffiliateProduct, ShoppingRequest, PushNotification.

The v0.1 `WildlifeSighting` sensitivity model was never implemented; if §10
option (a) is chosen, add it per the v0.1 field spec (preserved in git history).

## 12. Safety, Legal, and Trust Requirements

**Wildlife safety (retained verbatim in intent from v0.1 — binding).** No exact
alligator/sea-turtle location tracking, no "navigate to animal" action, no
gamified sighting leaderboard, no rewards for proximity, prominent safety
education. Align with NC Wildlife, Village of BHI, and BHI Conservancy guidance
(§18 sources).

**Transaction trust (now load-bearing, not hypothetical).**

- No booking is "Confirmed" unless a server/operator-confirmed record backs it.
- No payment state is trusted until confirmed server-side (webhook verified).
- No inventory is reduced by client code.
- No ticket/QR artifact is shown without official validity.

**Privacy.**

- Service-provider PII (legal names, background checks, IDs) stays in the
  `*PrivateInfo` entities with restricted RLS; never expose in public records.
- Public records must not leak `owner_email`, `commission_rate`,
  `subscription_status`, internal notes, or reviewer emails (audit #8).
- Admin exports and `downloadUserData` remain access-controlled and
  self-scoped.

**Security posture.** The current findings and remediation order are tracked in
`docs/SECURITY_AUDIT_2026-07-08_codex.md`. Closing P0/P1 there is a launch gate
for any paid marketing push.

## 13. UX & Copy Principles

Unchanged from v0.1 and still binding. Use "Official booking," "Planned ferry,"
"Last updated," "Verified," "Approximate area," "Observe from a safe distance."
Avoid "Confirmed" (unless source-backed), "Real-time animal location," "92%
confidence" (currently violated in FerryETA), "Guaranteed availability."

## 14. Current State & Rollout

The v0.1 phase plan (Phase 0 stabilize → Phase 1 informational → Phase 2 revenue
→ Phase 3 transactions) no longer maps to reality: the product is effectively
operating at "Phase 2/3" already. Re-cast the roadmap as **hardening waves**:

### Wave A — Security & Integrity (immediate, launch gate)

- Close audit P0: automation/notification auth (fail closed); remove browser
  `asServiceRole` from admin pages.
- Remove client-side `ParkingReservation.create` and the "92% confidence" ETA.
- Add idempotency + capacity/reconciliation to booking/order paths.
- Resolve `npm audit`; restore meaningful lint/typecheck gates.

Exit: no request can alter a charge; no endpoint runs unauthenticated; audit
P0/P1 closed.

### Wave B — Operational Legitimacy

- For each paid vertical: confirm a real operator/provider, acceptance step,
  cancellation/refund policy, and support contact — or revert it to lead-gen.
- Add source + freshness labels to all operational data (ferry, weather, events).
- Formalize provider onboarding/verification for the people-service
  marketplaces.

Exit: every checkout vertical is genuinely supportable; no flow implies a
partnership that doesn't exist.

### Wave C — Revenue Activation

- Package and sell enhanced listings + sponsored placement on the existing
  infrastructure.
- Optimize membership conversion/retention; activate lead attribution as a
  partner product.
- Resolve the Nature Mode decision (§10).

Exit: diversified revenue beyond commissions; first sold partner inventory.

## 15. Success Metrics

Add to v0.1's usage/trust/wildlife metrics the marketplace realities:

- **Transactions:** GMV and commission by vertical; booking completion rate;
  **booking-to-fulfillment rate** (did a human actually service it?); refund/
  dispute rate; double-booking incidents (should be zero after Wave A).
- **Membership:** trial-to-paid conversion; monthly/annual mix; retention/churn.
- **Live data trust:** stale-data incidents on ferry/weather/events; sync
  failure rate (`SyncLog`); user-reported inaccuracies.
- **Security/ops:** open audit findings by severity; time-to-close.

## 16. Engineering Backlog (reconciled)

### P0 (from `SECURITY_AUDIT_2026-07-08_codex.md`)

- Automation/notification endpoints: signed auth, fail closed.
- Remove browser-side `asServiceRole` (EventsAdmin, PartnersAdmin,
  BabysittingAdmin).
- Remove client `ParkingReservation.create`; remove "92% confidence" ETA.

### P1

- Idempotency + capacity checks + reconciliation on booking/order/sync.
- Harden `admin-ops` (per-entity field/op allowlists, audit log).
- Back community counters with real per-user rows.
- Server-side price verification audit across *all* paid verticals (confirm
  babysitting/lodging/birdie match the ferry/rental/food pattern).

### P2

- Split public/private schema fields; sanitize all outbound URLs (shared
  allowlist: https/http/mailto/tel).
- Resolve `npm audit`; fix 150 unused-import lint errors; fix typecheck config.
- SEO/metadata/manifest/robots; privacy policy + terms of service (now
  mandatory given payments and children's-service data).
- Keep entry-bundle weight in check (`APP_WEIGHT_LOG.md`).

## 17. Open Questions

- Which paid verticals have **real, contracted operators today**, and which are
  currently checkout flows without a supported back end?
- Can BHI Transportation provide a schedule/status API or sanctioned deep-links
  (to legitimize ferry/parking)?
- Will BHI Development Corp treat this as unofficial companion, official partner,
  or white-label guest service?
- Nature Mode: invest, keep-free, or drop (§10)?
- Does the babysitting vertical's handling of minors' logistics and provider
  background checks meet the legal/insurance bar for a paid marketplace?
- What is the support/operations staffing model behind the marketplace at scale?

## 18. Source References

- NC Wildlife Resources Commission alligator coexistence guidance:
  https://www.ncwildlife.gov/news/press-releases/2023/05/12/wildlife-commission-provides-tips-coexist-alligators
- NC Wildlife alligator species and safety page: https://www.ncwildlife.gov/alligator
- Village of Bald Head Island alligator guidance:
  https://villagebhi.org/visitors/learn-about-island-wildlife/alligators/
- Bald Head Island Conservancy wildlife safety: https://bhic.org/learn/wildlife-safety/
- Bald Head Island Transportation ferry and tram reservations:
  https://www.baldheadislandferry.com/tram/
- Internal: `docs/SECURITY_AUDIT_2026-07-08_codex.md`, `docs/APP_WEIGHT_LOG.md`

## 19. Product Decision Summary

The product is no longer a prototype to be salvaged into an informational guide —
it is a **live, broad, transactional island super-app**. The strategic task has
inverted accordingly:

1. **Harden before promoting.** Close the security findings and remove the
   remaining fake-transaction anti-patterns; the app takes real money now.
2. **Make breadth honest.** Every paid vertical needs a real operator and a
   support path, or it becomes lead-gen. Depth of support now beats breadth of
   features.
3. **Diversify revenue deliberately** beyond commissions and membership by
   activating the listing/sponsorship/attribution infrastructure already built.
4. **Decide the wildlife story** — invest in safe, coordinate-free Nature Mode as
   a differentiator, or retire it cleanly.

The live-data core (ferry, weather, events) is the genuine daily-habit
differentiator and should be protected and made demonstrably trustworthy. The
marketplace is the revenue engine and must be made demonstrably safe and
supportable. The wildlife feature can still be a signature — but only if it
sells context, never coordinates.
