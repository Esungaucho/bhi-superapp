import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const SOURCES = [
      {
        source: 'bhi_limited',
        label: 'Bald Head Island Limited',
        urls: [
          'https://www.baldheadisland.com/events/',
          'https://www.baldheadisland.com/calendar/',
        ],
      },
      {
        source: 'village_of_bhi',
        label: 'Village of Bald Head Island',
        urls: [
          'https://www.villageofbaldheadisland.com/events',
          'https://www.villageofbaldheadisland.com/calendar',
        ],
      },
      {
        source: 'bhi_conservancy',
        label: 'BHI Conservancy',
        urls: [
          'https://www.bhicconservancy.org/events',
          'https://www.bhicconservancy.org/calendar',
        ],
      },
      {
        source: 'bald_head_association',
        label: 'Bald Head Association',
        urls: [
          'https://www.baldheadassociation.com/events',
        ],
      },
      {
        source: 'old_baldy_foundation',
        label: 'Old Baldy Foundation',
        urls: [
          'https://www.oldbaldy.org/events',
        ],
      },
    ];

    const results = { totalFetched: 0, newEvents: 0, updatedEvents: 0, duplicates: 0, errors: [] };
    const now = new Date();

    // Fetch and parse each source using LLM to extract event data
    for (const source of SOURCES) {
      for (const url of source.urls) {
        try {
          // Fetch the page HTML
          const pageRes = await fetch(url, {
            headers: { 'User-Agent': 'BHI-SuperApp-EventSync/1.0' },
            signal: AbortSignal.timeout(15000),
          });
          if (!pageRes.ok) {
            results.errors.push(`${source.label}: HTTP ${pageRes.status} from ${url}`);
            continue;
          }
          const html = await pageRes.text();
          if (!html || html.length < 500) {
            results.errors.push(`${source.label}: No content from ${url}`);
            continue;
          }

          // Use LLM to extract structured event data from the HTML
          const truncatedHtml = html.slice(0, 30000);
          const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are an event extraction system. Extract all upcoming events from this HTML page content from ${source.label}. Return an array of events. Each event should have: title, description, short_description (1 sentence), category (one of: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal), start_time (ISO 8601 datetime), end_time (ISO 8601 datetime or null), all_day (boolean), location_name, address, registration_required (boolean), registration_url, tags (array of strings). Only include events that have a clear title and date. If no events found, return empty array. Focus on upcoming events only (from ${now.toISOString()} onwards).

HTML content:
${truncatedHtml}`,
            response_json_schema: {
              type: 'object',
              properties: {
                events: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      short_description: { type: 'string' },
                      category: { type: 'string' },
                      start_time: { type: 'string' },
                      end_time: { type: 'string' },
                      all_day: { type: 'boolean' },
                      location_name: { type: 'string' },
                      address: { type: 'string' },
                      registration_required: { type: 'boolean' },
                      registration_url: { type: 'string' },
                      tags: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
            add_context_from_internet: true,
          });

          const extractedEvents = llmRes.events || [];
          results.totalFetched += extractedEvents.length;

          for (const evt of extractedEvents) {
            if (!evt.title || !evt.start_time) continue;

            // Normalize: compute sync_hash for dedup
            const normalizedTitle = evt.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
            const normalizedDate = new Date(evt.start_time).toISOString().slice(0, 10);
            const syncHash = `${normalizedTitle}_${normalizedDate}`;

            // Check for existing event with same hash
            const existing = await base44.asServiceRole.entities.IslandEvent.filter({ sync_hash: syncHash });

            if (existing.length > 0) {
              const existingEvent = existing[0];
              if (existingEvent.admin_override) {
                results.duplicates++;
                continue;
              }
              // Update if source data changed
              const needsUpdate =
                existingEvent.title !== evt.title ||
                existingEvent.description !== evt.description ||
                existingEvent.source_url !== url;

              if (needsUpdate) {
                await base44.asServiceRole.entities.IslandEvent.update(existingEvent.id, {
                  title: evt.title,
                  description: evt.description,
                  short_description: evt.short_description || evt.description?.slice(0, 120),
                  end_time: evt.end_time || null,
                  all_day: evt.all_day || false,
                  is_all_day: evt.all_day || false,
                  location_name: evt.location_name || '',
                  address: evt.address || '',
                  registration_required: evt.registration_required || false,
                  registration_url: evt.registration_url || '',
                  tags: evt.tags || [],
                  source_url: url,
                  last_synced: now.toISOString(),
                });
                results.updatedEvents++;
              } else {
                results.duplicates++;
              }
            } else {
              // Create new event
              await base44.asServiceRole.entities.IslandEvent.create({
                title: evt.title,
                description: evt.description,
                short_description: evt.short_description || evt.description?.slice(0, 120),
                category: evt.category || 'community',
                start_time: evt.start_time,
                end_time: evt.end_time || null,
                all_day: evt.all_day || false,
                is_all_day: evt.all_day || false,
                location_name: evt.location_name || '',
                address: evt.address || '',
                organization: source.label,
                source: source.source,
                source_url: url,
                source_name: source.label,
                registration_required: evt.registration_required || false,
                registration_url: evt.registration_url || '',
                tags: evt.tags || [],
                featured: false,
                is_featured: false,
                status: 'synced',
                sync_hash: syncHash,
                last_synced: now.toISOString(),
              });
              results.newEvents++;
            }
          }
        } catch (sourceErr) {
          results.errors.push(`${source.label}: ${sourceErr.message}`);
        }
      }
    }

    // Remove expired events (start_time more than 1 day past)
    const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const expiredEvents = await base44.asServiceRole.entities.IslandEvent.filter({
      start_time: { $lt: expiredCutoff },
      admin_override: { $ne: true },
    });
    for (const evt of expiredEvents) {
      await base44.asServiceRole.entities.IslandEvent.delete(evt.id);
    }
    results.expiredRemoved = expiredEvents.length;

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('sync-island-events error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});