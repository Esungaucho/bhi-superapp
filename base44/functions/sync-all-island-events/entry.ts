import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════════
//  UNIFIED ISLAND EVENT SYNC
//  Reusable multi-source event importer for Bald Head Island.
//  Each source in SOURCE_REGISTRY is synced via Gemini web search,
//  deduplicated by sync_hash (title + date + org), and logged to SyncLog.
//  New sources = just add to the registry. That's it.
// ═══════════════════════════════════════════════════════════════════

interface SourceConfig {
  key: string;
  label: string;
  url: string;
  calendarUrl?: string;
  org: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  defaultImage: string;
  eventTypes: string;
  defaultCategory: string;
}

const SOURCE_REGISTRY: SourceConfig[] = [
  {
    key: 'old_baldy_foundation',
    label: 'Old Baldy Foundation',
    url: 'https://www.oldbaldy.org/events',
    calendarUrl: 'https://shop.oldbaldy.org/module/events.htm?pageComponentId=1840218',
    org: 'Old Baldy Foundation',
    location: 'Old Baldy Lighthouse & Smith Island Museum',
    address: '101 Lighthouse Wynd, Bald Head Island, NC 28461',
    lat: 33.8681, lng: -78.0022,
    defaultImage: 'https://images.unsplash.com/photo-1564550974352-31f9d8e2a8a6?w=800',
    eventTypes: 'Historic tours, lighthouse climbs, Jr. Keeper programs, happy hours, National Lighthouse Day, holiday celebrations, fundraisers',
    defaultCategory: 'lighthouse',
  },
  {
    key: 'bhi_conservancy',
    label: 'BHI Conservancy',
    url: 'https://bhic.org/calendar/',
    org: 'Bald Head Island Conservancy',
    location: 'BHI Conservancy Campus',
    address: '700 Bald Head Wynd, Bald Head Island, NC 28461',
    lat: 33.8704, lng: -78.0045,
    defaultImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    eventTypes: 'Turtle walks, nest monitoring, nature programs, birding, kayak tours, conservation education, kids camps, wildlife education',
    defaultCategory: 'conservation',
  },
  {
    key: 'village_of_bhi',
    label: 'Village of Bald Head Island',
    url: 'https://villagebhi.org/residents-owners/view/village-calendar/',
    org: 'Village of Bald Head Island',
    location: ' Village Hall, Bald Head Island, NC',
    address: '293 E Bald Head Wynd, Bald Head Island, NC 28461',
    lat: 33.8718, lng: -78.0033,
    defaultImage: 'https://images.unsplash.com/photo-1564550974352-31f9d8e2a8a6?w=800',
    eventTypes: 'Village council meetings, public hearings, community workshops, recycling events, municipal announcements, safety meetings',
    defaultCategory: 'government',
  },
  {
    key: 'bald_head_association',
    label: 'Bald Head Association',
    url: 'https://www.baldheadassociation.com/calendar-bha',
    org: 'Bald Head Association',
    location: 'BHA Office, Bald Head Island, NC',
    address: '293 E Bald Head Wynd, Bald Head Island, NC 28461',
    lat: 33.8718, lng: -78.0033,
    defaultImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    eventTypes: 'Community meetings, property owner forums, social events, board meetings, landscape committee, annual meeting',
    defaultCategory: 'community',
  },
  {
    key: 'village_chapel',
    label: 'Village Chapel of BHI',
    url: 'https://www.villagechapelofbaldheadisland.com/calendars.html',
    org: 'Village Chapel of Bald Head Island',
    location: 'Village Chapel, Bald Head Island, NC',
    address: '1 Blackjack Rd, Bald Head Island, NC 28461',
    lat: 33.8725, lng: -78.0028,
    defaultImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    eventTypes: 'Sunday worship services, Bible study, prayer meetings, community outreach, special holiday services, weddings',
    defaultCategory: 'community',
  },
  {
    key: 'shoals_club',
    label: 'Shoals Club',
    url: 'https://www.shoalsclub.com/events',
    org: 'Shoals Club',
    location: 'Shoals Club, Bald Head Island, NC',
    address: '1000 S Bald Head Wynd, Bald Head Island, NC 28461',
    lat: 33.8582, lng: -78.9728,
    defaultImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    eventTypes: 'Member dining events, live music, beach parties, holiday celebrations, kids activities, fitness classes, social gatherings',
    defaultCategory: 'club_events',
  },
  {
    key: 'bhi_club',
    label: 'Bald Head Island Club',
    url: 'https://www.bhiclub.net/',
    org: 'Bald Head Island Club',
    location: 'BHI Club, Bald Head Island, NC',
    address: '301 S Bald Head Wynd, Bald Head Island, NC 28461',
    lat: 33.8632, lng: -78.9785,
    defaultImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    eventTypes: 'Member golf tournaments, tennis socials, dining events, pool parties, holiday celebrations, junior programs',
    defaultCategory: 'club_events',
  },
  {
    key: 'bhi_marina',
    label: 'Bald Head Island Marina',
    url: 'https://www.baldheadisland.com/marina',
    org: 'Bald Head Island Marina',
    location: 'BHI Marina, Bald Head Island, NC',
    address: 'Channel Rd, Bald Head Island, NC 28461',
    lat: 33.8732, lng: -78.0010,
    defaultImage: 'https://images.unsplash.com/photo-1543881658-3f9f6b37a62b?w=800',
    eventTypes: 'Boating events, fishing tournaments, marina socials, boat shows, sailing regattas, water safety classes',
    defaultCategory: 'community',
  },
  {
    key: 'maritime_market',
    label: 'Maritime Market',
    url: 'https://www.maritimemarket.net/',
    org: 'Maritime Market',
    location: 'Maritime Market, Bald Head Island, NC',
    address: '14 Keelson Row, Bald Head Island, NC 28461',
    lat: 33.8735, lng: -78.0020,
    defaultImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    eventTypes: 'Cooking classes, wine tastings, food events, market specials, holiday menus, catering events',
    defaultCategory: 'dining',
  },
  {
    key: 'bhi_limited',
    label: 'Bald Head Island Limited',
    url: 'https://www.baldheadisland.com/events-news',
    org: 'Bald Head Island Limited',
    location: 'Bald Head Island, NC',
    address: 'Bald Head Island, NC 28461',
    lat: 33.8681, lng: -78.0022,
    defaultImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    eventTypes: 'Island-wide events, ferry celebrations, seasonal festivals, visitor activities, holiday events, community gatherings',
    defaultCategory: 'community',
  },
];

// ── Smart category detection ─────────────────────────────────────────
function categorizeEvent(title: string, description: string, sourceKey: string, defaultCat: string): string {
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();
  const text = `${t} ${d}`;
  const src = sourceKey || '';

  // Source-specific defaults
  if (src === 'old_baldy_foundation' && (text.includes('tour') || text.includes('lighthouse') || text.includes('keeper'))) return 'lighthouse';
  if (src === 'old_baldy_foundation' && text.includes('fundraiser')) return 'fundraiser';

  // Keyword-based detection
  if (text.includes('turtle') && (text.includes('walk') || text.includes('nest') || text.includes('hatch') || text.includes('program'))) return 'turtle_programs';
  if (text.includes('conservation') || text.includes('conservancy') || text.includes('wildlife') || text.includes('habitat')) return 'conservation';
  if (text.includes('lighthouse') || text.includes('old baldy') || text.includes('historic tour')) return 'lighthouse';
  if (text.includes('history') || text.includes('historical') || text.includes('heritage') || text.includes('museum')) return 'history';
  if (text.includes('fundraiser') || text.includes('auction') || text.includes('benefit') || text.includes('gala')) return 'fundraiser';
  if (text.includes('education') || text.includes('workshop') || text.includes('class') || text.includes('lecture') || text.includes('seminar') || text.includes('camp')) return 'educational';
  if (text.includes('live music') || text.includes('concert') || text.includes('band') || text.includes('acoustic')) return 'music';
  if (text.includes('art') || text.includes('culture') || text.includes('gallery') || text.includes('craft')) return 'arts_culture';
  if (text.includes('food') || text.includes('drink') || text.includes('dining') || text.includes('wine') || text.includes('tasting') || text.includes('dinner')) return 'dining';
  if (text.includes('fitness') || text.includes('yoga') || text.includes('run') || text.includes('5k') || text.includes('walk') && text.includes('fitness')) return 'fitness';
  if (text.includes('holiday') || text.includes('christmas') || text.includes('easter') || text.includes('july 4') || text.includes('halloween') || text.includes('thanksgiving')) return 'holiday';
  if (text.includes('kids') || text.includes('child') || text.includes('junior') || text.includes('jr.') || text.includes('camp')) return 'kids';
  if (text.includes('family')) return 'family';
  if (text.includes('nature') || text.includes('bird') || text.includes('kayak') || text.includes('hike')) return 'nature';
  if (src === 'bhi_conservancy') return 'conservation';
  if (src === 'shoals_club' || src === 'bhi_club') return 'club_events';
  if (src === 'village_of_bhi' || src === 'bald_head_association') return 'community';

  return defaultCat || 'community';
}

// ── Sync a single source ─────────────────────────────────────────────
async function syncSource(source: SourceConfig, base44: any, isScheduled: boolean) {
  const now = new Date();
  const result = {
    source: source.label,
    sourceKey: source.key,
    status: 'connected' as string,
    eventsFound: 0,
    eventsImported: 0,
    eventsUpdated: 0,
    eventsArchived: 0,
    eventsFailed: 0,
    duplicatesSkipped: 0,
    errors: [] as string[],
  };

  // Build LLM prompt — one call for all upcoming events in next 90 days
  const yearStr = now.getFullYear();
  const dateRange = `${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} through ${new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  try {
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search for and extract ALL upcoming events from ${source.label} on Bald Head Island, North Carolina.

Check these URLs:
- ${source.url}
${source.calendarUrl ? `- ${source.calendarUrl}` : ''}

This organization typically hosts: ${source.eventTypes}

Events should be on Bald Head Island, NC or hosted by ${source.org}.

For EACH event found, extract:
- title: The exact event title
- start_time: ISO 8601 datetime (use ${yearStr} as the year; infer the day from the calendar)
- end_time: ISO 8601 datetime or null if not specified
- description: Full event description if available
- event_url: Direct URL to the event detail page if available
- location: Event venue or location name if different from default
- image_url: Hero image URL if visible on the page

CRITICAL RULES:
- Only include events that ACTUALLY appear on the ${source.label} website or calendar.
- Do NOT invent, fabricate, or hallucinate any events.
- Focus on events between ${dateRange}.
- If you cannot find any events, return an empty events array.
- Use the correct year based on the event date.`,
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
                location: { type: 'string' },
                image_url: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const parsedEvents = (llmRes.events || []).map((evt: any) => {
      const startDate = new Date(evt.start_time);
      const endTime = evt.end_time ? new Date(evt.end_time) : null;
      return {
        title: evt.title,
        detailUrl: evt.event_url || source.url,
        startDate,
        endTime: (endTime && !isNaN(endTime.getTime())) ? endTime : null,
        description: evt.description || '',
        location: evt.location || source.location,
        imageUrl: evt.image_url || source.defaultImage,
      };
    }).filter((evt: any) => evt.title && !isNaN(evt.startDate.getTime()));

    result.eventsFound = parsedEvents.length;
    const allSyncHashes = new Set<string>();

    // Create / update each event
    for (const evt of parsedEvents) {
      try {
        const normalizedTitle = evt.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
        const normalizedDate = evt.startDate.toISOString().slice(0, 10);
        const syncHash = `${normalizedTitle}_${normalizedDate}_${source.key}`;
        allSyncHashes.add(syncHash);

        const category = categorizeEvent(evt.title, evt.description, source.key, source.defaultCategory);
        const description = evt.description || '';

        const eventData = {
          title: evt.title,
          description,
          short_description: description ? description.slice(0, 140) : `${source.label} event`,
          category,
          start_time: evt.startDate.toISOString(),
          end_time: evt.endTime ? evt.endTime.toISOString() : null,
          all_day: false,
          is_all_day: false,
          location_name: evt.location,
          address: source.address,
          latitude: source.lat,
          longitude: source.lng,
          organization: source.org,
          source: source.key,
          source_url: evt.detailUrl,
          source_name: source.label,
          featured_image: evt.imageUrl,
          image_url: evt.imageUrl,
          registration_required: evt.detailUrl !== source.url,
          registration_url: evt.detailUrl,
          tags: [source.key, category],
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
      } catch (evtErr: any) {
        result.eventsFailed++;
        result.errors.push(`"${evt.title}": ${evtErr.message}`);
      }
    }

    // Archive events from this source that were NOT found in this sync
    let hasMore = true;
    let skip = 0;
    while (hasMore) {
      const sourceEvents = await base44.asServiceRole.entities.IslandEvent.filter(
        { source: source.key, status: { $ne: 'archived' } },
        '-created_date', 100, skip
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

    // Determine status
    if (result.errors.length === 0 && result.eventsFound > 0) {
      result.status = 'connected';
    } else if (result.eventsFound === 0 && result.errors.length === 0) {
      result.status = 'connected'; // No events found but no error — source may just have no events
    } else if (result.eventsImported > 0 || result.eventsUpdated > 0) {
      result.status = 'requires_admin_review';
    } else if (result.errors.length > 0) {
      result.status = 'failed';
    }

    // Log to SyncLog
    await base44.asServiceRole.entities.SyncLog.create({
      source_name: source.label,
      source_key: source.key,
      source_url: source.url,
      status: result.status,
      events_found: result.eventsFound,
      events_imported: result.eventsImported,
      events_updated: result.eventsUpdated,
      events_failed: result.eventsFailed,
      duplicates_skipped: result.duplicatesSkipped,
      extraction_method: 'llm_web_search',
      error_message: result.errors.join('; ').slice(0, 2000) || '',
      notes: `Archived: ${result.eventsArchived}. Source: ${source.label}`,
      sync_type: isScheduled ? 'scheduled' : 'admin_trigger',
    });

  } catch (err: any) {
    result.status = 'failed';
    result.errors.push(err.message);

    // Log failure
    try {
      await base44.asServiceRole.entities.SyncLog.create({
        source_name: source.label,
        source_key: source.key,
        source_url: source.url,
        status: 'failed',
        events_found: 0,
        events_imported: 0,
        events_updated: 0,
        events_failed: 0,
        duplicates_skipped: 0,
        extraction_method: 'llm_web_search',
        error_message: err.message.slice(0, 2000),
        notes: 'Fatal error during source sync',
        sync_type: isScheduled ? 'scheduled' : 'admin_trigger',
      });
    } catch (logErr) {
      console.error(`Failed to log ${source.label} error:`, logErr.message);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════
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

    // Parse body for optional source_key
    let body: any = {};
    try { body = await req.json(); } catch { /* no body = sync all */ }
    const requestedSource = body.source_key;

    const sourcesToSync = requestedSource
      ? SOURCE_REGISTRY.filter(s => s.key === requestedSource)
      : SOURCE_REGISTRY;

    if (sourcesToSync.length === 0) {
      return Response.json({ error: `Unknown source: ${requestedSource}` }, { status: 400 });
    }

    // Sync each source independently — one failure doesn't stop others
    const sourceResults = [];
    for (const source of sourcesToSync) {
      console.log(`Syncing ${source.label}...`);
      const result = await syncSource(source, base44, isScheduled);
      sourceResults.push(result);
    }

    // Build summary
    const summary = {
      sourcesSynced: sourceResults.length,
      totalFound: sourceResults.reduce((s, r) => s + r.eventsFound, 0),
      totalImported: sourceResults.reduce((s, r) => s + r.eventsImported, 0),
      totalUpdated: sourceResults.reduce((s, r) => s + r.eventsUpdated, 0),
      totalArchived: sourceResults.reduce((s, r) => s + r.eventsArchived, 0),
      totalFailed: sourceResults.reduce((s, r) => s + r.eventsFailed, 0),
      sourceResults,
    };

    return Response.json({ success: true, ...summary });
  } catch (error) {
    console.error('sync-all-island-events error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});