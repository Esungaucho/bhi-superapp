# BHI SuperApp Product Requirements Document

Version: 0.1
Date: May 6, 2026
Status: Draft for product, engineering, partnership, and investor review
Repository: bhi-superapp

## 1. Executive Summary

BHI SuperApp should launch first as a trusted informational companion for Bald Head Island residents, homeowners, rental guests, contractors, day visitors, and local businesses. The current prototype correctly identifies the island's core user needs: ferry logistics, parking, tram timing, weather, beach conditions, maps, restaurants, lodging, rentals, shops, alerts, and local discovery. However, the application should not launch as a transactional marketplace until official operators and partners provide authoritative inventory, booking rights, support processes, and commercial agreements.

The recommended product strategy is to become the most trusted daily and trip-planning intelligence layer for Bald Head Island:

- What do I need to know today?
- How do I get to, around, and off the island?
- What is open, safe, available, or worth doing?
- Where do I go to complete official bookings?
- How do I enjoy the island while respecting residents, property, and wildlife?

The initial business model should rely on trust-based revenue rather than transaction volume:

- Verified business listings
- Sponsored placements
- Property-manager guest guides
- Premium visitor/resident intelligence
- Privacy-preserving wildlife and nature mode
- Partner analytics and lead attribution

Transactional revenue should be deferred until phase 3, after the product has trust, traffic, and signed partner integrations.

## 2. Product Positioning

### Working Name

BHI Companion

Alternative names:

- Bald Head Daily
- BHI Guide
- Island Companion
- BHI Today

The app should not over-index on the term "SuperApp" in public positioning. "SuperApp" communicates ambition internally, but residents and high-income visitors will respond better to language that feels trusted, calm, official-adjacent, and service-oriented.

### Product Promise

The calm, trusted way to plan and enjoy Bald Head Island.

### Public Description

BHI Companion gives residents and visitors a clear view of ferry and tram planning, island conditions, open businesses, maps, wildlife safety, local alerts, and official booking links.

### Target Quality Bar

The audience includes affluent homeowners, repeat seasonal visitors, property managers, and guests expecting a high-service island experience. The product should feel:

- Accurate
- Current
- Quietly premium
- Non-gimmicky
- Privacy-aware
- Locally respectful
- Operationally reliable

The product should not feel like a coupon app, fake marketplace, generic travel template, or speculative AI demo.

## 3. Strategic Rationale

### Why Not Transactions First

The current prototype contains several transactional flows that are not safe to ship:

- Ferry bookings are created client-side and marked confirmed without official operator confirmation.
- Parking reservations are created against hard-coded lot data.
- Lodging, rental, and food orders can be marked confirmed without payment, vendor acceptance, inventory locking, cancellation policy enforcement, or support workflows.
- Admin revenue screens imply business operations that are not yet reconciled against real payments.

This risks user trust, partner trust, public safety, and legal exposure.

### Recommended Trust Ladder

1. Informational utility: become useful every day and before every trip.
2. Verified local guide: become the best current directory and map.
3. Partner lead generation: drive users to official booking and business channels.
4. Assisted requests: introduce low-risk requests where humans can confirm.
5. Transactions: add payments only where inventory, support, and partner contracts exist.

## 4. Goals

### Product Goals

- Make BHI logistics easier for first-time and repeat visitors.
- Reduce confusion around ferry, tram, parking, luggage, arrival timing, and departure timing.
- Create a trusted daily island dashboard for homeowners and residents.
- Help local businesses and property managers communicate accurate information.
- Provide wildlife and nature features that educate users without encouraging unsafe crowding.
- Build monetizable engagement before transaction infrastructure is ready.

### Business Goals

- Build audience and repeat usage without needing immediate transaction agreements.
- Create sellable partner inventory: enhanced listings, sponsorships, guest guides, and analytics.
- Establish credibility with BHI Development Corp, BHI Transportation, BHI Conservancy, Village of BHI, property managers, and local merchants.
- Prepare a technical foundation that can later support transactions safely.

### Engineering Goals

- Remove fake transactional behavior from public flows.
- Make public information accessible without authentication.
- Establish an architecture that separates public content, partner/admin tools, and future transaction services.
- Reduce dependency risk and clean up quality gates.
- Implement privacy, role-based access control, auditability, and analytics from the start.

## 5. Non-Goals

The MVP will not:

- Sell ferry tickets inside the app.
- Confirm parking reservations inside the app.
- Take lodging, rental, food, or retail payments.
- Display exact real-time locations for sensitive wildlife.
- Present unofficial estimates as authoritative facts.
- Replace official BHI Transportation, Village of BHI, or BHI Conservancy channels.
- Launch a native mobile app before validating web/PWA retention.

## 6. Users and Personas

### First-Time Visitor

Needs simple travel instructions, ferry/tram/parking clarity, safe wildlife guidance, what is open, and a shareable trip checklist.

### Repeat Vacation Guest

Needs departure reminders, seasonal business hours, restaurant/rental suggestions, weather/tide conditions, and family-friendly alerts.

### Homeowner or Resident

Needs daily conditions, ferry status, local alerts, business hours, maintenance/service directory, wildlife safety, and discreet resident-oriented information.

### Property Manager

Needs a polished guest guide, fewer repetitive guest questions, trusted arrival/departure instructions, and controlled recommendations.

### Local Business

Needs accurate listings, visibility, sponsored placement, seasonal updates, analytics, and a path toward future transactions.

### Contractor or Service Provider

Needs transportation, barge, parking, map, island access, and directory information.

### Naturalist / Conservancy Partner

Needs wildlife reporting that improves awareness and citizen science without encouraging harassment, feeding, crowding, or unsafe behavior.

### Admin / Operator

Needs content moderation, listing verification, partner management, ads, analytics, source freshness, and emergency override controls.

## 7. MVP Product Concept

### MVP Name

BHI Companion: Public Information and Island Intelligence MVP

### MVP Core Screens

1. Today Dashboard
2. Getting Here
3. Ferry and Tram Planner
4. Parking Guide
5. Island Conditions
6. Map and Directory
7. Food, Shops, Rentals, and Services
8. Wildlife and Nature Mode
9. Trip Packet
10. Alerts and Notifications
11. Partner/Admin Console

## 8. Functional Requirements

### 8.1 Public Today Dashboard

Purpose:
Give users a fast answer to "What should I know right now?"

Requirements:

- Show ferry status and next departures using official or clearly sourced data.
- Show tram/arrival reminders and official booking link.
- Show current weather, wind, tide, beach flag, and last updated time.
- Show "open now" businesses and key services.
- Show relevant alerts: weather, ferry delay, safety, wildlife, event, infrastructure.
- Show wildlife safety card when recent sensitive activity is reported.
- Show official booking buttons that link out to official sites.
- No login required.

Acceptance criteria:

- Dashboard loads for anonymous users.
- Every operational data point has a visible source or "last updated" marker.
- Official booking CTAs never imply in-app confirmation.
- If data is stale, UI degrades gracefully with a freshness warning.

### 8.2 Getting Here

Purpose:
Reduce trip anxiety and missed ferry/tram reservations.

Requirements:

- Explain the basic BHI arrival flow: drive to ferry terminal, park, handle luggage, board ferry, connect to tram if applicable.
- Provide official ferry/tram reservation link.
- Provide official parking link.
- Provide reminders based on official guidance, including arriving early enough for parking, luggage handling, and boarding.
- Include checklists for day trip, overnight stay, family trip, pets, and contractors.
- Allow trip date entry without account creation.

Acceptance criteria:

- Users can generate a pre-trip checklist in under 60 seconds.
- All official action buttons open official BHI Transportation or other authorized pages.
- The app never creates a ferry, tram, or parking reservation in MVP.

### 8.3 Ferry and Tram Planner

Purpose:
Help users choose and prepare for the correct ferry and tram flow.

Requirements:

- Display ferry schedules with source and last updated time.
- Display "reserve officially" CTA.
- Display tram planning guidance, including outbound pickup windows when applicable.
- Display common FAQ items: luggage timing, standby, missed ferry, tram pickup, where to go.
- Allow users to save a planned ferry time locally or in their account.
- Use the saved plan for reminders and the trip packet.

Acceptance criteria:

- Saving a planned ferry does not claim a confirmed booking.
- The UI labels saved plans as "planned" or "saved," not "booked" or "confirmed."
- Users can jump from a ferry plan to official reservation flow.

### 8.4 Parking Guide

Purpose:
Provide clear, current parking information without pretending to control inventory.

Requirements:

- Replace hard-coded reservation flow with informational parking guide.
- Link to official parking page.
- Display known lot options only if sourced and timestamped.
- Avoid showing non-authoritative pricing unless verified.
- Allow users to add vehicle plate and parking notes to their private trip packet.

Acceptance criteria:

- No `ParkingReservation.create` call in public MVP.
- No hard-coded rate displayed as current unless sourced and dated.
- Parking CTA uses language like "Open official parking" or "Check parking."

### 8.5 ETA and Door-to-Door Planning

Purpose:
Help users understand travel timing without overstating precision.

Requirements:

- Replace hard-coded city-to-minute logic with either:
  - Real routing API integration, or
  - Clearly labeled planning estimates.
- Remove unsupported confidence claims such as "92% confidence."
- Provide buffer recommendations for parking, luggage, ferry boarding, and tram timing.
- Explain what assumptions are included.
- Allow users to save a leave-by reminder.

Acceptance criteria:

- Every ETA displays "estimated" or "based on current routing" depending on data source.
- If no routing API is enabled, the app uses conservative ranges rather than precise values.
- No confidence percentage is shown without a real model and validation process.

### 8.6 Island Conditions

Purpose:
Make weather, tide, beach, and safety conditions a daily habit.

Requirements:

- Show temperature, feels-like, wind, humidity, tide, beach flag, water temperature, wave height, UV, and source.
- Show last updated time.
- Integrate official or reputable weather/tide data provider.
- Allow admin override for urgent local notes.
- Provide condition-triggered safety guidance.

Acceptance criteria:

- Conditions page shows stale-data warning if older than configured threshold.
- Safety copy is concise and source-linked.
- Weather data failures do not break the app.

### 8.7 Map and Directory

Purpose:
Create the most useful local map for visitors and residents.

Requirements:

- Show restaurants, shops, services, rentals, lodging, beach accesses, restrooms, parking, emergency services, and key landmarks.
- Support category filters and "open now."
- Display verified status and last updated timestamp.
- Allow businesses to claim/update listing through admin workflow.
- Support sponsored pins with clear labeling.
- Avoid over-clutter with tasteful priority rules.

Acceptance criteria:

- Users can find a business by name, category, and map.
- Sponsored content is clearly labeled.
- Unverified listings are visually distinct or excluded from premium placement.

### 8.8 Food, Shops, Rentals, and Services

Purpose:
Support discovery before commerce.

Requirements:

- Convert restaurant, shop, rental, and service pages to informational or lead-gen pages.
- Replace "order," "checkout," and "reserve" with "call," "website," "directions," "request info," or "official booking" as appropriate.
- Add source, verified status, hours, phone, website, map link, and seasonal notes.
- Allow partner-paid enhanced content: images, featured items, offers, service areas.

Acceptance criteria:

- No public MVP flow creates paid orders or confirmed reservations.
- Business contact actions are tracked for analytics.
- Listings can be updated by admin without deploy.

### 8.9 Trip Packet

Purpose:
Turn the app into a practical pre-arrival and departure companion.

Requirements:

- Users can create a trip with arrival date, departure date, lodging area, party type, and optional saved ferry plans.
- Generate arrival checklist.
- Generate departure checklist.
- Include official booking links.
- Include weather/wildlife/conditions summary.
- Include property-manager custom notes where applicable.
- Allow shareable read-only link.

Acceptance criteria:

- Anonymous users can create a local trip packet.
- Logged-in users can save trip packets across devices.
- Property managers can create branded guest packets in admin.

### 8.10 Wildlife and Nature Mode

Purpose:
Monetize island-specific nature intelligence while protecting wildlife and public safety.

Product principle:
Paid access may provide better context, education, and freshness, but it must not provide precise real-time locations for sensitive wildlife.

Free requirements:

- Species guide for alligators, sea turtles, birds, foxes, deer, coyotes, and other local wildlife.
- Safety guidance for alligator areas, lagoons, pets, children, beach wildlife, and injured animals.
- 48-hour-delayed sightings for non-sensitive species, displayed at coarse area level.
- Historic/seasonal heatmaps.
- Links and phone guidance for BHI Conservancy and Public Safety.

Paid requirements:

- Fresh zone-level wildlife activity.
- Naturalist commentary.
- Verified photo feed.
- Tide/weather-linked nature predictions.
- Alerts such as "large alligator activity reported near freshwater lagoon areas today."
- Safe viewing recommendations and education.
- Optional contribution/revenue share to BHI Conservancy or conservation partner.

Sensitive species requirements:

- Alligators: no exact live pins, no named-animal tracking page, no route-to-animal button.
- Sea turtles: no nest, hatchling, or crawl exact locations unless approved for public education by proper authority.
- Nesting birds, dens, injured animals, and rare species: hidden or heavily generalized.
- Reports of feeding, harassment, unsafe proximity, fishing in lagoons, or emergency wildlife issues route to proper authority guidance.

Location privacy rules:

- Sensitive sightings are stored with exact coordinates internally only if needed for moderation or partner research.
- Public display uses zone-level, grid-level, or landmark-area approximation.
- Display delay depends on sensitivity:
  - Low sensitivity: real-time or near real-time allowed.
  - Medium sensitivity: approximate and delayed.
  - High sensitivity: approximate only, delayed, or not public.
  - Critical sensitivity: private to moderators/partners only.
- Paid users never receive precise locations for high-risk wildlife.

Moderation requirements:

- Users can submit sighting with species, photo, behavior, approximate location, timestamp, and notes.
- Submissions start as unverified.
- Moderators can approve, reject, generalize, classify sensitivity, and escalate.
- Repeat unsafe submitters can be blocked.
- App educates before submission: do not approach, feed, touch, harass, or crowd wildlife.

Acceptance criteria:

- No UI encourages users to approach wildlife.
- No sensitive species exact location appears in public or paid UI.
- Every wildlife screen includes safety framing.
- Emergency concern flow links users to BHI Conservancy wildlife hotline guidance and Public Safety guidance.

### 8.11 Alerts and Notifications

Purpose:
Provide timely island-relevant alerts without becoming noisy.

Requirements:

- Alert categories: ferry, tram, weather, beach, wildlife, business hours, event, emergency, property-manager note.
- Users can follow a trip, category, or location area.
- Push notifications are optional and require explicit opt-in.
- Alerts have severity, source, expiry, and last updated metadata.
- Admin can publish urgent alerts.

Acceptance criteria:

- Alerts expire automatically.
- Users can configure alert categories.
- Emergency-style alerts require admin confirmation.

### 8.12 Accounts and Personalization

Purpose:
Make accounts useful but not required.

Requirements:

- Public app works without login.
- Login unlocks saved trip packets, favorites, notification preferences, resident/homeowner profile, and paid features.
- User profile options should align with actual use cases:
  - Visitor
  - Homeowner
  - Resident
  - Long-term renter
  - Contractor
  - Business owner
  - Property manager
- Avoid gating basic information behind authentication.

Acceptance criteria:

- Anonymous user can access dashboard, guide, map, directory, weather, wildlife safety, and official links.
- Account prompt appears only when saving, subscribing, claiming listing, or setting notifications.

### 8.13 Admin Console

Purpose:
Run the product like a local information business.

Requirements:

- Admin routes must be role-gated.
- Admin users can manage listings, sources, alerts, sponsorships, wildlife moderation, partners, trip packet templates, and analytics.
- Partner users can manage only their own listing and campaigns.
- Naturalist/verifier users can moderate wildlife sightings only within assigned permissions.
- Every material content change is audit logged.

Acceptance criteria:

- Non-admin users cannot see admin navigation or load admin routes.
- All admin mutations record actor, timestamp, before/after data, and reason where relevant.
- Partner permissions cannot access revenue-wide or cross-partner data.

## 9. Monetization Requirements

### Phase 1 Revenue

1. Enhanced business listings
   - Monthly pricing by category and prominence.
   - Includes photos, verified badge, seasonal notes, offers, and analytics.

2. Sponsored placements
   - Dashboard placements.
   - Map sponsored pins.
   - Weather/contextual placements.
   - Directory category sponsorships.

3. Property-manager guest guides
   - Branded trip packets for rental guests.
   - Seasonal information updates.
   - Guest analytics and support deflection.

4. Wildlife/Nature Mode subscription
   - Suggested starting point: $5/month or seasonal pass.
   - Must be positioned as education, safety, and conservation-aware intelligence.
   - Consider donating or revenue sharing with conservation partner.

### Phase 2 Revenue

- Lead attribution for official booking links and partner actions.
- Concierge request forms.
- Featured seasonal packages.
- Sponsored alerts and tasteful offers.

### Phase 3 Revenue

- Integrated transactions only after signed partner agreements:
  - Rentals
  - Activities
  - Restaurant pickup
  - Grocery/pre-arrival packages
  - Concierge requests
  - Lodging leads or bookings where properly contracted
- Ferry, tram, and parking transactions require explicit operator integration and should not be attempted without it.

## 10. Technical Architecture

### Current Prototype Assessment

The current Vite/React/Base44 prototype is useful as:

- Product concept map
- UI prototype
- Base entity sketch
- Demo for partners

It is not sufficient as:

- Transaction system
- Source of truth for inventory
- Public SEO platform in current hosted configuration
- Secure admin platform
- Wildlife moderation system

### Recommended Architecture

#### Frontend

Option A: Continue Vite/PWA for fast iteration.

Option B: Move public surface to Next.js for SEO, metadata, public pages, and server-side rendering.

Recommendation:
Use Next.js or a hybrid approach before broad public launch if SEO and public content acquisition matter. Keep the current React components as design/prototype input.

#### Backend

Use a real backend and database for production:

- Postgres for structured data.
- API service for content, users, listings, sightings, alerts, analytics, and partner workflows.
- Server-side RBAC.
- Audit logging.
- Scheduled jobs for source refresh and stale data checks.
- Webhook ingestion for future payment and booking integrations.

Base44 may remain useful for prototyping or early CMS workflows, but it should not be the long-term production system of record for sensitive data or transactions.

#### Data Sources

- Official BHI Transportation ferry/tram links and guidance.
- Weather provider.
- Tide provider.
- Village/BHIC safety guidance.
- Admin-entered local alerts.
- Partner-updated business data.
- User-submitted wildlife sightings with moderation.

#### Analytics

Track:

- Dashboard active users.
- Official booking link clicks.
- Directory searches.
- Calls, website clicks, directions clicks.
- Trip packets created/shared.
- Alerts subscribed/opened.
- Wildlife reports submitted/verified.
- Paid conversion.
- Partner lead attribution.

Do not track:

- Precise user location by default.
- Sensitive wildlife exact public locations.
- Children's data beyond normal account safeguards.

## 11. Data Model Requirements

### Core Entities

- User
- UserProfile
- Trip
- TripPlanItem
- Business
- BusinessClaim
- BusinessHours
- BusinessOffer
- SponsoredPlacement
- Alert
- SourceStatus
- FerryScheduleSnapshot
- ParkingInfoSnapshot
- IslandCondition
- MapPoint
- WildlifeSighting
- WildlifeSpecies
- WildlifeModerationAction
- Subscription
- PartnerAccount
- AnalyticsEvent
- AuditLog

### WildlifeSighting Fields

- id
- submitted_by_user_id
- species_id
- submitted_at
- observed_at
- exact_lat_internal
- exact_lng_internal
- public_area_label
- public_geohash_or_zone
- location_precision_public
- sensitivity_level
- status: pending, verified, rejected, hidden, escalated
- photo_url
- behavior: basking, crossing, swimming, nesting, injured, feeding_by_humans, aggressive, unknown
- moderator_notes
- public_notes
- source: user, moderator, partner, imported
- expires_at

### Sensitivity Levels

- low: common/non-sensitive, approximate or precise depending on species
- medium: approximate location, optional delay
- high: approximate zone only, no exact public map
- critical: private only, authority or partner visibility

## 12. Safety, Legal, and Trust Requirements

### Wildlife Safety

The app must align with official guidance:

- BHI notes alligators are common around golf course lagoons and freshwater ponds.
- BHI prohibits fishing and swimming in lagoons and freshwater ponds.
- Feeding alligators violates rules/laws and can lead to fines.
- BHI guidance says to observe alligators from a safe distance.
- BHI Conservancy directs wildlife emergencies or concerns to its wildlife hotline and unsafe human interactions to Public Safety.
- NC Wildlife says alligators should not be fed, approached, handled, harassed, or provoked.

Product implications:

- No exact alligator tracking.
- No "navigate to animal" actions.
- No gamified leaderboard for sightings.
- No rewards that encourage approaching wildlife.
- No user language that romanticizes dangerous proximity.
- Prominent safety education in report and view flows.

### Transaction Trust

- No booking is confirmed unless confirmed by authoritative system.
- No payment state is trusted until confirmed server-side.
- No inventory is reduced client-side.
- No QR/ticket artifact is shown without official validity.

### Privacy

- Public user submissions must not expose home addresses.
- Wildlife sightings near private homes should be generalized.
- Property-manager guest guides must avoid exposing private access details unless intended.
- Admin exports should be access-controlled.

## 13. UX Requirements

### Design Principles

- Calm, island-premium, highly legible.
- Mobile-first, but not app-only.
- Information density should be useful, not cluttered.
- Avoid cartoonish wildlife treatment for serious safety contexts.
- Sponsored content should feel native but clearly labeled.
- Official links should be unmistakable.

### Copy Principles

Use:

- "Official booking"
- "Planned ferry"
- "Last updated"
- "Verified"
- "Approximate area"
- "Observe from a safe distance"

Avoid:

- "Confirmed" unless confirmed by source of truth
- "Real-time animal location"
- "Find Fluffy now"
- "92% confidence" without evidence
- "Secret wildlife spots"
- "Guaranteed availability"

## 14. Rollout Plan

### Phase 0: Stabilize Prototype

Duration: 1-2 weeks

Tasks:

- Remove fake transaction CTAs.
- Gate admin routes.
- Make public routes accessible without login.
- Fix metadata, title, favicon, noindex state, and manifest.
- Remove unused imports.
- Fix or disable broken typecheck configuration.
- Audit and prune unused dependencies.
- Add PRD-aligned route labels.

Exit criteria:

- Public app can be demoed safely.
- No fake bookings or reservations can be created by users.
- Build and lint pass.

### Phase 1: Public Informational MVP

Duration: 4-8 weeks

Tasks:

- Build public Today Dashboard.
- Build Getting Here and Trip Packet.
- Build ferry/tram/parking official-link flows.
- Build verified directory and map.
- Build island conditions page with real data source.
- Build wildlife safety guide and delayed/coarse sightings.
- Build admin CMS for listings, alerts, and sources.
- Add analytics.

Exit criteria:

- Product can be shared publicly with visitors and homeowners.
- Information is source-labeled and trustworthy.
- Businesses can be onboarded manually.

### Phase 2: Revenue and Partner Tools

Duration: 6-10 weeks

Tasks:

- Enhanced listing plans.
- Sponsored placements.
- Property-manager guest guide product.
- Wildlife/Nature Mode subscription.
- Partner dashboard.
- Lead attribution.
- Moderation workflows.

Exit criteria:

- First paying partners or property managers onboarded.
- Paid wildlife/nature feature passes safety review.
- Partner reporting is credible.

### Phase 3: Select Transactions

Duration: 3-6 months after Phase 2 validation

Tasks:

- Identify low-risk transaction category.
- Sign partner agreements.
- Build server-side transaction service.
- Add payment provider.
- Add webhooks, refunds, support, reconciliation.
- Pilot with one partner/category.

Exit criteria:

- Transaction pilot has support workflows and reconciliation.
- No transaction is client-confirmed.
- Users understand cancellation/refund terms.

## 15. Success Metrics

### MVP Usage

- Weekly active users.
- Returning users.
- Dashboard views.
- Ferry/tram official link clicks.
- Parking official link clicks.
- Trip packets created.
- Directory searches.
- Map interactions.
- Alert opt-ins.

### Trust and Quality

- Data source freshness.
- Error rate.
- Stale data incidents.
- Partner correction requests.
- User-reported inaccurate info.
- Support contacts per active user.

### Monetization

- Enhanced listing conversion.
- Sponsored placement revenue.
- Property-manager guide revenue.
- Paid Nature Mode conversion.
- Partner lead volume.
- Cost per acquired subscriber.

### Wildlife Safety

- Reports submitted.
- Reports verified.
- Reports rejected for unsafe behavior.
- Sensitive sightings protected.
- Public safety escalations.
- No evidence of crowding caused by app.

## 16. Engineering Backlog From Review Findings

### P0

- Replace client-side ferry booking with official booking handoff.
- Replace parking reservation creation with official parking guide.
- Remove fake QR/ticket surfaces.
- Remove local "confirmed" states from lodging/rental/food until transaction backend exists.

### P1

- Add role-gated admin routing.
- Remove admin from global public menu.
- Replace hard-coded ETA with real routing or conservative estimates.
- Add source and freshness metadata to schedules, conditions, and directory data.
- Make public informational pages accessible without login.

### P2

- Prune unused dependencies.
- Resolve npm audit vulnerabilities.
- Fix lint errors.
- Fix typecheck configuration.
- Update app title, favicon, manifest, SEO metadata, and robots state.
- Add privacy policy and terms.

## 17. Open Questions

- Will BHI Development Corp support this as an unofficial companion, official partner, or white-labeled property/guest service?
- Can BHI Transportation provide schedule/status API or approved deep-linking?
- Can BHI Conservancy partner on wildlife safety, moderation rules, and revenue share?
- Which property managers are most likely to pay for branded guest guides?
- Which local businesses have the highest pain around visibility and seasonal updates?
- Is consumer-paid Nature Mode acceptable to local stakeholders if exact sensitive locations are never sold?
- Should the public product use "Bald Head" or "BHI" branding, and what naming rights or trademark constraints apply?

## 18. Source References

- NC Wildlife Resources Commission alligator coexistence guidance: https://www.ncwildlife.gov/news/press-releases/2023/05/12/wildlife-commission-provides-tips-coexist-alligators
- NC Wildlife alligator species and safety page: https://www.ncwildlife.gov/alligator
- Village of Bald Head Island alligator guidance: https://villagebhi.org/visitors/learn-about-island-wildlife/alligators/
- Bald Head Island Conservancy wildlife safety: https://bhic.org/learn/wildlife-safety/
- Bald Head Island Transportation ferry and tram reservations: https://www.baldheadislandferry.com/tram/

## 19. Product Decision Summary

The application should be salvaged as a premium island intelligence product, not shipped as the current transaction-heavy prototype. The best path is:

1. Launch an accurate public guide.
2. Build trust through daily utility.
3. Monetize local visibility, guest-guide operations, sponsorships, and safe premium nature intelligence.
4. Add transactions only after partnership, backend, payment, inventory, and support infrastructure exist.

The wildlife feature can be a signature differentiator, especially because Bald Head Island has memorable wildlife stories and real safety needs. The product must, however, sell context rather than coordinates. The app should help people understand and respect the island, not direct crowds toward sensitive animals.
