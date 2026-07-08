# App Weight & Change Log

System of record for how heavy the BHI SuperApp is getting as features land.
Base44 auto-commits every change to this repo, so **git history is the version
archive** — any two versions can be compared at
`https://github.com/Esungaucho/bhi-superapp/compare/<old>...<new>`.

## How to add a row

After merging a feature batch to `main`:

```
npm run build
node scripts/app-metrics.mjs --append
```

Then commit this file. Add a short entry under **Change index** describing what
the batch added.

## Metrics

- **JS bundle** is the strongest user-facing weight signal — it ships to every
  visitor on first load. Vite recommends chunks stay under ~500 KB.
- **Entities/Functions** are backend surface: they don't slow the client but
  add operational load (sync jobs, LLM calls, quota usage) and audit surface.

| Date | Commit | Pages | Components | Entities | Functions | src LOC | Deps | JS bundle | CSS |
|------|--------|-------|------------|----------|-----------|---------|------|-----------|-----|
| 2026-07-03 | d43578d | 107 | 136 | 71 | 8 | 33,915 | 64 | 2122 KB | 120 KB |
| 2026-07-08 | 86a0588 | 120 | 153 | 85 | 21 | 38,972 | 64 | 2527 KB | 127 KB |

## Change index

### 2026-07-03 → 2026-07-08 (`d43578d...86a0588`, 56 commits, +10,685 / −1,224 lines)

The MVP-with-static-data era ends here: this window is the pivot to live data.

**Live & dynamic data (the big push)**
- *Ferry tracking*: `FerryStatus`, `FerryVessel`, `FerryAnnouncement`,
  `FerrySchedule` entities; `sync-ferry-status` and `notify-ferry-alert`
  functions; FerryStatus page, FerryAdmin console; tracker map, status card,
  departure list, alerts components.
- *Weather & marine*: `fetch-weather` and `getBHIWeatherMarineStatus`
  functions; dashboard weather module; WeatherDashboard rework; BeachFinder
  expansion.
- *Event ingestion pipeline*: `EventSource` + `SyncLog` entities;
  `sync-island-events`, `sync-event-source`, `analyze-event-source` (LLM),
  `notify-new-event` functions; EventSourceManager + ManualEventForm +
  SyncLogList admin UI; major `IslandEvent` schema expansion; calendar
  search/filter and new Upcoming/Weekend views.

**Monetization & membership**
- `Membership` entity, Membership page, `useMembership` hook, premium upgrade
  prompt, Founders page.
- `AffiliateProduct` entity + ShopBeforeArrive page; `ShoppingRequest` entity
  + MainlandShoppers page.

**New utility features**
- Push notifications (`PushNotification` entity, NotificationAdmin, permission
  prompt), Transportation & parking (`ParkingSpot`, `ValetWaitlist`,
  TransportationParking, CarLocator), trip planning (`PlanItem`, MyPlans),
  onboarding tutorial slides, shared bottom nav, ConciergeToolsAdmin.

**Security hardening (July audit follow-through)**
- PR #2: admin guard on AdminShell; reviewSubmission locked down.
- Booking/order flows moved fully server-side (`book-ferry`, `book-rental`,
  `place-food-order` price from trusted entities via service role); create-RLS
  on `FerryBooking`/`RentalBooking`/`FoodOrder`/`OrderItem` locked to
  admin-only; `community-interact` increment clamped to ±1.
- PII split into `BabysitterPrivateInfo` / `BirdieShopperPrivateInfo`.

**Weight assessment**: JS bundle +19% in 5 days (2.07 → 2.47 MB) as a single
chunk. Feature code, not dependencies, is driving growth (deps flat at 64).
Biggest available win: route-based code splitting (`React.lazy` per shell) so
guests stop downloading admin/agent/captain code — worth doing before the next
feature batch. Backend surface nearly tripled (8 → 21 functions); watch Base44
usage quotas on the sync/LLM functions via `SyncLog`.
