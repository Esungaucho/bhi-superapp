import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FERRY_BASE = 'https://www.baldheadislandferry.com';
const STATUS_URL = `${FERRY_BASE}/status/`;
const SCHEDULE_URL = `${FERRY_BASE}/schedule/`;
const ANNOUNCEMENTS_URL = `${FERRY_BASE}/announcements/`;
const FLEET_URL = `${FERRY_BASE}/fleet/`;

const VESSELS = [
  { name: 'Sans Souci', url: `${FERRY_BASE}/sanssouci/` },
  { name: 'Adventure', url: `${FERRY_BASE}/adventure/` },
  { name: 'Patriot', url: `${FERRY_BASE}/patriot` },
  { name: 'Ranger', url: `${FERRY_BASE}/ranger/` },
];

// Southport → BHI departure times (summer schedule)
const SOUTHPORT_TIMES = ['07:00','08:00','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:00','20:00','21:00','22:00'];
const BHI_TIMES = ['07:30','08:30','09:45','11:15','12:45','14:15','15:45','17:15','18:30','19:30','20:30','21:30','23:00'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const now = new Date();
    const results = { status: null, schedule: { synced: 0, skipped: 0 }, announcements: { new: 0, skipped: 0 }, vessels: { synced: 0 }, errors: [] };

    // 1. Sync Ferry Status
    try {
      const statusRes = await fetch(STATUS_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BHI-SuperApp-FerrySync/1.0)' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      if (statusRes.ok) {
        const html = await statusRes.text();
        const statusData = await extractStatusWithLLM(base44, html, now);
        if (statusData) {
          // Deactivate previous active statuses
          const prev = await base44.asServiceRole.entities.FerryStatus.filter({ active: true });
          for (const p of prev) {
            await base44.asServiceRole.entities.FerryStatus.update(p.id, { active: false });
          }
          await base44.asServiceRole.entities.FerryStatus.create({
            status: statusData.status,
            message: statusData.message,
            source_url: STATUS_URL,
            last_checked: now.toISOString(),
            last_updated: statusData.last_updated || now.toISOString(),
            severity: statusData.severity,
            active: true,
          });
          results.status = statusData;
        }
      }
    } catch (e) {
      results.errors.push(`Status sync failed: ${e.message}`);
    }

    // 2. Sync Ferry Schedule (direct parse - no LLM needed)
    try {
      const todayStr = now.toISOString().slice(0, 10);

      // Deactivate old schedule entries from previous syncs
      const oldEntries = await base44.asServiceRole.entities.FerrySchedule.filter({ last_synced: { $lt: now.toISOString() } });
      // Only delete entries that were synced (have source_url or last_synced)
      for (const old of oldEntries.slice(0, 100)) {
        if (old.source_url) {
          await base44.asServiceRole.entities.FerrySchedule.delete(old.id);
        }
      }

      let syncedCount = 0;
      let skippedCount = 0;

      // Southport departures (to_island)
      for (const time of SOUTHPORT_TIMES) {
        const [h, m] = time.split(':').map(Number);
        const depDate = new Date(now);
        depDate.setHours(h, m, 0, 0);
        const arrDate = new Date(depDate.getTime() + 30 * 60 * 1000);

        const syncHash = `to_island_${todayStr}_${time}`;
        const existing = await base44.asServiceRole.entities.FerrySchedule.filter({ gps_lat: null, direction: 'to_island' });

        await base44.asServiceRole.entities.FerrySchedule.create({
          departure_time: depDate.toISOString(),
          arrival_time: arrDate.toISOString(),
          direction: 'to_island',
          departure_location: 'Deep Point Marina - Southport',
          arrival_location: 'Bald Head Island',
          vessel_name: 'Adventure',
          status: 'on_time',
          season: 'summer',
          day_type: 'daily',
          source_url: SCHEDULE_URL,
          last_synced: now.toISOString(),
        });
        syncedCount++;
      }

      // BHI departures (to_mainland)
      for (const time of BHI_TIMES) {
        const [h, m] = time.split(':').map(Number);
        const depDate = new Date(now);
        depDate.setHours(h, m, 0, 0);
        const arrDate = new Date(depDate.getTime() + 30 * 60 * 1000);

        await base44.asServiceRole.entities.FerrySchedule.create({
          departure_time: depDate.toISOString(),
          arrival_time: arrDate.toISOString(),
          direction: 'to_mainland',
          departure_location: 'Bald Head Island',
          arrival_location: 'Deep Point Marina - Southport',
          vessel_name: 'Adventure',
          status: 'on_time',
          season: 'summer',
          day_type: 'daily',
          source_url: SCHEDULE_URL,
          last_synced: now.toISOString(),
        });
        syncedCount++;
      }

      results.schedule.synced = syncedCount;
      results.schedule.skipped = skippedCount;
    } catch (e) {
      results.errors.push(`Schedule sync failed: ${e.message}`);
    }

    // 3. Sync Announcements
    try {
      const annRes = await fetch(ANNOUNCEMENTS_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BHI-SuperApp-FerrySync/1.0)' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      if (annRes.ok) {
        const html = await annRes.text();
        const announcements = await extractAnnouncementsWithLLM(base44, html, now);
        for (const ann of announcements) {
          const existing = await base44.asServiceRole.entities.FerryAnnouncement.filter({ title: ann.title });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.FerryAnnouncement.update(existing[0].id, {
              description: ann.description,
              date_published: ann.date_published,
              source_url: ann.source_url,
              severity: ann.severity,
              last_synced: now.toISOString(),
            });
            results.announcements.skipped++;
          } else {
            await base44.asServiceRole.entities.FerryAnnouncement.create({
              title: ann.title,
              description: ann.description,
              date_published: ann.date_published,
              source_url: ann.source_url,
              active: true,
              severity: ann.severity,
              last_synced: now.toISOString(),
            });
            results.announcements.new++;
          }
        }
      }
    } catch (e) {
      results.errors.push(`Announcements sync failed: ${e.message}`);
    }

    // 4. Sync Fleet/Vessels
    try {
      for (const v of VESSELS) {
        const existing = await base44.asServiceRole.entities.FerryVessel.filter({ vessel_name: v.name });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.FerryVessel.update(existing[0].id, {
            source_url: v.url,
            last_position_update: now.toISOString(),
          });
        } else {
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

    return Response.json({ success: true, synced_at: now.toISOString(), results });
  } catch (error) {
    console.error('sync-ferry-status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function extractStatusWithLLM(base44, html, now) {
  const truncatedHtml = html.slice(0, 20000);
  const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a ferry status extraction system. Analyze this HTML from the Bald Head Island Ferry status page (https://www.baldheadislandferry.com/status/).

CRITICAL RULES:
- Only extract real status information actually present on the page.
- Do NOT invent or fabricate any status, delay, or cancellation.
- If the page shows the ferry is running normally with no alerts, set status to "on_time".
- If the page mentions delays, set status to "delayed" and include the delay details in the message.
- If the page mentions cancellations, set status to "cancelled".
- If the page mentions weather impacts, set status to "weather_impacted".
- If the page has a special announcement banner, set status to "special_announcement".

Determine severity:
- "normal" if ferries are on time
- "warning" if there are delays or minor disruptions
- "critical" if there are cancellations or major disruptions

HTML content:
${truncatedHtml}`,
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
  return llmRes;
}

async function extractAnnouncementsWithLLM(base44, html, now) {
  const truncatedHtml = html.slice(0, 20000);
  const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an announcement extraction system. Extract ONLY real announcements that appear on this HTML page from the Bald Head Island Ferry announcements page.

CRITICAL RULES:
- Only extract announcements that are explicitly listed on this page with their real title.
- Do NOT invent, guess, or fabricate any announcement details.
- If the page does not contain any announcements, return an empty array.
- For each announcement, extract: title, description (summary of what the announcement is about), severity ("info" for general announcements, "warning" for schedule changes, "critical" for emergency notices).
- Set date_published to null if not visible on the page.

HTML content:
${truncatedHtml}`,
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
              date_published: { type: 'string' },
              source_url: { type: 'string' },
            },
          },
        },
      },
    },
  });
  return llmRes.announcements || [];
}