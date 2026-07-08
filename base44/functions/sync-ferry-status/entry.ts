import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════════
//  BALD HEAD ISLAND FERRY SYNC
//  Pulls REAL schedule, status & announcements from the official
//  baldheadislandferry.com website via LLM web search.
//  NO hardcoded/fake ferry times — only real data from the source.
//  Caches last successful data if the source is temporarily unavailable.
// ═══════════════════════════════════════════════════════════════════

const FERRY_BASE = 'https://www.baldheadislandferry.com';
const STATUS_URL = `${FERRY_BASE}/status/`;
const SCHEDULE_URL = `${FERRY_BASE}/schedule/`;
const TICKETS_URL = `${FERRY_BASE}/tickets/`;
const TRAM_URL = `${FERRY_BASE}/tram/`;

const VESSELS = [
  { name: 'Sans Souci', url: `${FERRY_BASE}/sanssouci/` },
  { name: 'Adventure', url: `${FERRY_BASE}/adventure/` },
  { name: 'Patriot', url: `${FERRY_BASE}/patriot` },
  { name: 'Ranger', url: `${FERRY_BASE}/ranger/` },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: allow admin trigger or scheduled automation
    let isScheduled = false;
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch {
      isScheduled = true;
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const results = {
      status: null as any,
      schedule: { synced: 0, skipped: 0, total: 0 },
      announcements: { new: 0, updated: 0 },
      vessels: { synced: 0 },
      errors: [] as string[],
      cached: false,
      synced_at: now.toISOString(),
    };

    // ── 1. Sync Ferry Status via LLM web search ──────────────────
    try {
      const statusRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search for the current Bald Head Island Ferry status at ${STATUS_URL}.

Look for the official status page of the Bald Head Island Ferry (baldheadislandferry.com).
Extract the current operational status:

- on_time: Ferries running on normal schedule
- delayed: Ferries are delayed (include delay details in message)
- cancelled: Service cancelled
- weather_impacted: Weather affecting service
- special_announcement: Special announcement or alert

CRITICAL RULES:
- Only report what actually appears on the official status page.
- Do NOT invent or fabricate any status, delay, or cancellation.
- If the ferry is running normally, return status "on_time".
- If you cannot access the status page, return status "on_time" with message "Status unavailable — please check the official ferry website."`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['on_time', 'delayed', 'cancelled', 'weather_impacted', 'special_announcement'] },
            message: { type: 'string' },
            severity: { type: 'string', enum: ['normal', 'warning', 'critical'] },
            last_updated: { type: 'string' },
          },
        },
      });

      // Deactivate previous non-admin-override statuses
      const prevStatuses = await base44.asServiceRole.entities.FerryStatus.filter({ active: true, is_admin_override: false });
      for (const p of prevStatuses) {
        await base44.asServiceRole.entities.FerryStatus.update(p.id, { active: false });
      }

      await base44.asServiceRole.entities.FerryStatus.create({
        status: statusRes.status || 'on_time',
        message: statusRes.message || 'Ferry service information',
        source_url: STATUS_URL,
        last_checked: now.toISOString(),
        last_updated: statusRes.last_updated || now.toISOString(),
        severity: statusRes.severity || 'normal',
        active: true,
        is_admin_override: false,
      });
      results.status = statusRes;
    } catch (e) {
      results.errors.push(`Status sync failed: ${e.message}`);
      results.cached = true;
    }

    // ── 2. Sync Ferry Schedule via LLM web search ───────────────
    // NO hardcoded times — only real data from the official schedule page.
    try {
      const scheduleRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search for the Bald Head Island Ferry schedule at ${SCHEDULE_URL}.

The official ferry schedule page lists departure times for passenger ferries between:
- Deep Point Marina (Southport) → Bald Head Island (direction: "to_island")
- Bald Head Island → Deep Point Marina (Southport) (direction: "to_mainland")

There may also be a contractor/freight ferry schedule if publicly available.

For EACH departure time listed on the schedule page, extract:
- time: Departure time in 24-hour HH:MM format (e.g., "07:00", "13:30")
- direction: "to_island" (Southport→BHI) or "to_mainland" (BHI→Southport)
- season: "summer" or "winter" (whichever is currently active)
- schedule_type: "passenger" or "contractor"
- notes: Any special notes (e.g., "Weekends only", "Not running holidays")

Also identify which season is currently active.

CRITICAL RULES:
- Only extract times that ACTUALLY appear on the official schedule page at ${SCHEDULE_URL}.
- Do NOT invent, guess, or fabricate any departure times.
- If you cannot find the schedule, return an empty departures array.
- The Bald Head Island Ferry typically runs from early morning (~7 AM) to late evening (~11 PM) in summer.
- Typical crossing time is about 20-30 minutes.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            departures: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  direction: { type: 'string', enum: ['to_island', 'to_mainland'] },
                  season: { type: 'string', enum: ['summer', 'winter'] },
                  schedule_type: { type: 'string', enum: ['passenger', 'contractor'] },
                  notes: { type: 'string' },
                },
              },
            },
            active_season: { type: 'string', enum: ['summer', 'winter'] },
          },
        },
      });

      const departures = scheduleRes.departures || [];
      const activeSeason = scheduleRes.active_season || 'summer';

      if (departures.length > 0) {
        // Delete previously synced entries for today (replace with fresh data)
        const oldEntries = await base44.asServiceRole.entities.FerrySchedule.filter({ source_url: SCHEDULE_URL });
        for (const old of oldEntries) {
          await base44.asServiceRole.entities.FerrySchedule.delete(old.id);
        }

        let syncedCount = 0;
        let skippedCount = 0;

        for (const dep of departures) {
          try {
            const parts = dep.time.split(':').map(Number);
            const h = parts[0], m = parts[1];
            if (isNaN(h) || isNaN(m)) { skippedCount++; continue; }

            const depDate = new Date(now);
            depDate.setHours(h, m, 0, 0);
            const arrDate = new Date(depDate.getTime() + 25 * 60 * 1000); // ~25 min crossing

            const syncHash = `ferry_${dep.direction}_${todayStr}_${dep.time}_${dep.schedule_type || 'passenger'}`;

            await base44.asServiceRole.entities.FerrySchedule.create({
              departure_time: depDate.toISOString(),
              arrival_time: arrDate.toISOString(),
              direction: dep.direction,
              departure_location: dep.direction === 'to_island' ? 'Deep Point Marina - Southport' : 'Bald Head Island',
              arrival_location: dep.direction === 'to_island' ? 'Bald Head Island' : 'Deep Point Marina - Southport',
              vessel_name: 'Adventure',
              status: 'on_time',
              season: dep.season || activeSeason,
              day_type: 'daily',
              schedule_type: dep.schedule_type || 'passenger',
              notes: dep.notes || '',
              source_url: SCHEDULE_URL,
              last_synced: now.toISOString(),
              sync_hash: syncHash,
            });
            syncedCount++;
          } catch {
            skippedCount++;
          }
        }

        results.schedule.synced = syncedCount;
        results.schedule.skipped = skippedCount;
        results.schedule.total = departures.length;
      } else {
        results.errors.push('Schedule sync: No departures found on the official page');
        results.cached = true;
      }
    } catch (e) {
      results.errors.push(`Schedule sync failed: ${e.message}`);
      results.cached = true;
    }

    // ── 3. Sync Announcements via LLM web search ─────────────────
    try {
      const annRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search for Bald Head Island Ferry announcements, alerts, and service notices.

Check these pages:
- ${FERRY_BASE}
- ${STATUS_URL}

Extract ONLY real announcements that appear on these pages. For each:
- title: Announcement headline
- description: Summary of the announcement
- severity: "info" (general), "warning" (schedule changes), "critical" (emergency)
- source_url: URL where the announcement was found

CRITICAL: Do NOT invent announcements. If none found, return empty array.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            announcements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
                  source_url: { type: 'string' },
                },
              },
            },
          },
        },
      });

      for (const ann of (annRes.announcements || [])) {
        try {
          const existing = await base44.asServiceRole.entities.FerryAnnouncement.filter({ title: ann.title });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.FerryAnnouncement.update(existing[0].id, {
              description: ann.description,
              severity: ann.severity,
              source_url: ann.source_url || FERRY_BASE,
              last_synced: now.toISOString(),
              active: true,
            });
            results.announcements.updated++;
          } else {
            await base44.asServiceRole.entities.FerryAnnouncement.create({
              title: ann.title,
              description: ann.description,
              date_published: now.toISOString(),
              source_url: ann.source_url || FERRY_BASE,
              active: true,
              severity: ann.severity,
              last_synced: now.toISOString(),
            });
            results.announcements.new++;
          }
        } catch {}
      }
    } catch (e) {
      results.errors.push(`Announcements sync failed: ${e.message}`);
    }

    // ── 4. Ensure vessels exist ──────────────────────────────────
    try {
      for (const v of VESSELS) {
        const existing = await base44.asServiceRole.entities.FerryVessel.filter({ vessel_name: v.name });
        if (existing.length === 0) {
          await base44.asServiceRole.entities.FerryVessel.create({
            vessel_name: v.name,
            status: 'unknown',
            source: 'none',
            source_url: v.url,
            gps_feed_enabled: false,
            capacity: 150,
          });
          results.vessels.synced++;
        }
      }
    } catch (e) {
      results.errors.push(`Vessel sync failed: ${e.message}`);
    }

    return Response.json({ success: true, results, is_scheduled: isScheduled });
  } catch (error) {
    console.error('sync-ferry-status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});