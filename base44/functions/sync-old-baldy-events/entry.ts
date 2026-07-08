import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Old Baldy Foundation Event Sync ──────────────────────────────────
// Reusable event importer pattern: use LLM with web search to fetch &
// parse source calendar → dedup by sync_hash → create/update →
// archive removed events → log. Future sources follow the same
// structure with their own URL + prompt.

const SOURCE_KEY = 'old_baldy_foundation';
const SOURCE_LABEL = 'Old Baldy Foundation';
const CALENDAR_URL = 'https://shop.oldbaldy.org/module/events.htm?pageComponentId=1840218';
const EVENTS_PAGE_URL = 'https://www.oldbaldy.org/events';
const ORG_LAT = 33.8681;
const ORG_LNG = -78.0022;
const ORG_LOCATION = 'Old Baldy Lighthouse & Smith Island Museum';
const ORG_ADDRESS = '101 Lighthouse Wynd, Bald Head Island, NC 28461';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1564550974352-31f9d8e2a8a6?w=800';

function categorizeEvent(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('tour') || t.includes('lighthouse') || t.includes('historic')) return 'arts_culture';
  if (t.includes('jr. keeper') || t.includes('kids')) return 'kids';
  if (t.includes('happy hour')) return 'dining';
  if (t.includes('bunny') || t.includes('easter')) return 'family';
  if (t.includes('memorial')) return 'community';
  if (t.includes('parade') || t.includes('fourth') || t.includes('july')) return 'holiday';
  if (t.includes('tree') || t.includes('luminary') || t.includes('auction')) return 'seasonal';
  if (t.includes('duck race') || t.includes('food drive')) return 'community';
  if (t.includes('art')) return 'arts_culture';
  return 'arts_culture';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: allow admin trigger or scheduled automation (no user context)
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
    const result = {
      source: SOURCE_LABEL,
      monthsSynced: [],
      eventsFound: 0,
      eventsImported: 0,
      eventsUpdated: 0,
      duplicatesSkipped: 0,
      eventsArchived: 0,
      eventsFailed: 0,
      errors: [],
    };

    // Determine current and next month
    const cur = new Date(now.getFullYear(), now.getMonth(), 1);
    const nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthsToFetch = [
      { month: cur.getMonth() + 1, year: cur.getFullYear(), label: cur.toLocaleString('en-US', { month: 'long', year: 'numeric' }) },
      { month: nxt.getMonth() + 1, year: nxt.getFullYear(), label: nxt.toLocaleString('en-US', { month: 'long', year: 'numeric' }) },
    ];

    const allParsedEvents = [];

    // ── Use LLM with web search to extract events ──
    // The Old Baldy calendar at shop.oldbaldy.org blocks Deno Deploy IPs,
    // so we use Gemini's web search to fetch and parse the calendar.
    for (const m of monthsToFetch) {
      result.monthsSynced.push(m.label);

      try {
        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search for and extract ALL events from the Old Baldy Foundation calendar for ${m.label}.

The calendar is located at: ${CALENDAR_URL}&month=${m.month}&year=${m.year}
Also check: ${EVENTS_PAGE_URL}

This calendar lists events at the Old Baldy Lighthouse on Bald Head Island, NC. Common events include:
- Island Wide Golf Cart Historic Tour (recurring, usually 11:00 am)
- Jr. Keeper Program (ages 5-8 and 9-11, usually 4:30 pm)
- Historic Happy Hours
- Special events (Bunny Trail, Memorial Day Ceremony, Luminary Night, etc.)

For EACH event found, extract:
- title: The exact event title
- start_time: ISO 8601 datetime (use ${m.year} as the year; infer the day from the calendar)
- end_time: ISO 8601 datetime or null if not specified
- description: Full event description if available from the event detail page
- event_url: Direct URL to the event detail page on shop.oldbaldy.org if available

CRITICAL RULES:
- Only include events that actually appear on the Old Baldy Foundation calendar.
- Do NOT invent or fabricate any events.
- If you cannot find the calendar for this month, return an empty events array.
- Use the correct year (${m.year}) and month (${m.month}).`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    start_time: { type: 'string' },
                    end_time: { type: 'string' },
                    description: { type: 'string' },
                    event_url: { type: 'string' },
                  },
                },
              },
            },
          },
        });

        const monthEvents = (llmRes.events || []).map(evt => {
          const startDate = new Date(evt.start_time);
          const endTime = evt.end_time ? new Date(evt.end_time) : null;
          return {
            title: evt.title,
            detailUrl: evt.event_url || `${CALENDAR_URL}&month=${m.month}&year=${m.year}`,
            startDate,
            description: evt.description || '',
            endTime: (endTime && !isNaN(endTime.getTime())) ? endTime : null,
          };
        }).filter(evt => evt.title && !isNaN(evt.startDate.getTime()));

        result.eventsFound += monthEvents.length;
        allParsedEvents.push(...monthEvents);
      } catch (llmErr) {
        result.errors.push(`${m.label} LLM extraction failed: ${llmErr.message}`);
      }
    }

    // ── Create / update events ──
    const allSyncHashes = new Set();

    for (const evt of allParsedEvents) {
      try {
        const normalizedTitle = evt.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
        const normalizedDate = evt.startDate.toISOString().slice(0, 10);
        const syncHash = `${normalizedTitle}_${normalizedDate}`;
        allSyncHashes.add(syncHash);

        const description = evt.description || '';
        const category = categorizeEvent(evt.title);

        const eventData = {
          title: evt.title,
          description,
          short_description: description ? description.slice(0, 140) : `${SOURCE_LABEL} event`,
          category,
          start_time: evt.startDate.toISOString(),
          end_time: evt.endTime ? evt.endTime.toISOString() : null,
          all_day: false,
          is_all_day: false,
          location_name: ORG_LOCATION,
          address: ORG_ADDRESS,
          latitude: ORG_LAT,
          longitude: ORG_LNG,
          organization: SOURCE_LABEL,
          source: SOURCE_KEY,
          source_url: evt.detailUrl,
          source_name: SOURCE_LABEL,
          featured_image: DEFAULT_IMAGE,
          image_url: DEFAULT_IMAGE,
          registration_required: true,
          registration_url: evt.detailUrl,
          tags: ['old_baldy', 'lighthouse', category],
          status: 'synced',
          last_synced: now.toISOString(),
        };

        const existing = await base44.asServiceRole.entities.IslandEvent.filter({ sync_hash: syncHash });

        if (existing.length > 0) {
          const ex = existing[0];
          if (ex.admin_override) { result.duplicatesSkipped++; continue; }
          await base44.asServiceRole.entities.IslandEvent.update(ex.id, {
            ...eventData,
            status: ex.status === 'archived' ? 'synced' : ex.status,
            sync_hash: syncHash,
          });
          result.eventsUpdated++;
        } else {
          await base44.asServiceRole.entities.IslandEvent.create({ ...eventData, sync_hash: syncHash });
          result.eventsImported++;
        }
      } catch (evtErr) {
        result.eventsFailed++;
        result.errors.push(`Event "${evt.title}": ${evtErr.message}`);
      }
    }

    // ── Archive events from this source that were NOT found in this sync ──
    let hasMore = true;
    let skip = 0;
    while (hasMore) {
      const sourceEvents = await base44.asServiceRole.entities.IslandEvent.filter(
        { source: SOURCE_KEY, status: { $ne: 'archived' } },
        '-created_date',
        100,
        skip
      );
      hasMore = sourceEvents.length === 100;
      skip += sourceEvents.length;

      for (const evt of sourceEvents) {
        if (!allSyncHashes.has(evt.sync_hash)) {
          const eventDate = new Date(evt.start_time);
          if (eventDate > now) {
            await base44.asServiceRole.entities.IslandEvent.update(evt.id, { status: 'archived' });
            result.eventsArchived++;
          }
        }
      }
    }

    // ── Log sync ──
    const syncStatus = result.errors.length === 0
      ? 'connected'
      : result.eventsImported > 0 || result.eventsUpdated > 0
        ? 'requires_admin_review'
        : 'failed';

    await base44.asServiceRole.entities.SyncLog.create({
      source_name: SOURCE_LABEL,
      source_key: SOURCE_KEY,
      source_url: EVENTS_PAGE_URL,
      status: syncStatus,
      events_found: result.eventsFound,
      events_imported: result.eventsImported,
      events_updated: result.eventsUpdated,
      events_failed: result.eventsFailed,
      duplicates_skipped: result.duplicatesSkipped,
      extraction_method: 'llm_web_search',
      error_message: result.errors.join('; ').slice(0, 2000) || '',
      notes: `Months: ${result.monthsSynced.join(', ')}. Archived: ${result.eventsArchived}`,
      sync_type: isScheduled ? 'scheduled' : 'admin_trigger',
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('sync-old-baldy-events error:', error);

    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.SyncLog.create({
        source_name: SOURCE_LABEL,
        source_key: SOURCE_KEY,
        source_url: EVENTS_PAGE_URL,
        status: 'failed',
        events_found: 0,
        events_imported: 0,
        events_updated: 0,
        events_failed: 0,
        duplicates_skipped: 0,
        extraction_method: 'llm_web_search',
        error_message: error.message.slice(0, 2000),
        notes: 'Fatal error during sync',
        sync_type: 'scheduled',
      });
    } catch (logErr) {
      console.error('Failed to log sync error:', logErr.message);
    }

    return Response.json({ error: error.message }, { status: 500 });
  }
});