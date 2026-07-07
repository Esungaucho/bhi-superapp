import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const OFFICIAL_SOURCES = [
      {
        source: 'bhi_limited',
        label: 'Bald Head Island Limited',
        urls: ['https://www.baldheadisland.com/events-news'],
      },
      {
        source: 'village_of_bhi',
        label: 'Village of Bald Head Island',
        urls: [
          'https://villagebhi.org/residents-owners/view/village-calendar/',
          'https://villagebhi.org/announcements/',
        ],
      },
      {
        source: 'bhi_conservancy',
        label: 'BHI Conservancy',
        urls: ['https://bhic.org/calendar/'],
      },
      {
        source: 'bald_head_association',
        label: 'Bald Head Association',
        urls: ['https://www.baldheadassociation.com/calendar-bha'],
      },
      {
        source: 'old_baldy_foundation',
        label: 'Old Baldy Foundation',
        urls: ['https://www.oldbaldy.org/'],
      },
    ];

    const results = { totalFetched: 0, newEvents: 0, updatedEvents: 0, duplicates: 0, sourceResults: [], errors: [] };
    const now = new Date();

    for (const source of OFFICIAL_SOURCES) {
      for (const url of source.urls) {
        const sourceResult = {
          source: source.label,
          url,
          status: 'success',
          eventsFound: 0,
          eventsImported: 0,
          eventsUpdated: 0,
          duplicates: 0,
          error: null,
          notes: '',
        };

        try {
          const pageRes = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BHI-SuperApp-EventSync/1.0)',
              'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(20000),
            redirect: 'follow',
          });

          if (!pageRes.ok) {
            sourceResult.status = 'failed';
            sourceResult.error = `HTTP ${pageRes.status}`;
            results.errors.push(`${source.label}: HTTP ${pageRes.status} from ${url}`);
            await logSync(base44, source.label, url, 'failed', 0, 0, 0, 0, `HTTP ${pageRes.status}`, '', 'admin_trigger');
            results.sourceResults.push(sourceResult);
            continue;
          }

          const html = await pageRes.text();
          if (!html || html.length < 500) {
            sourceResult.status = 'needs_manual_setup';
            sourceResult.notes = 'Page returned no usable content — may require JavaScript rendering or manual setup';
            await logSync(base44, source.label, url, 'needs_manual_setup', 0, 0, 0, 0, '', sourceResult.notes, 'admin_trigger');
            results.sourceResults.push(sourceResult);
            continue;
          }

          // Try JSON-LD first
          let extractedEvents = extractJsonLdEvents(html);

          // Fallback to LLM extraction
          if (extractedEvents.length === 0) {
            const truncatedHtml = html.slice(0, 30000);
            const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `You are an event extraction system. Extract ONLY real, actual events that appear on this HTML page from ${source.label}. 

CRITICAL RULES:
- Only extract events that are explicitly listed on this page with their real title and date.
- Do NOT invent, guess, or fabricate any event details.
- If a title or date is not clearly present for an event, skip it.
- If the page does not contain any actual events, return an empty array.
- Never generate fictional events.

Each event must include: title, description (from the page, or empty string if not present), short_description, category (one of: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal), start_time (ISO 8601 datetime), end_time (ISO 8601 or null), all_day (boolean), location_name (from the page or empty string), address (from the page or empty string), registration_required (boolean), registration_url (from the page or empty string), tags (array).

Only include events with start_time on or after ${now.toISOString()}.
Return ONLY events actually present on this page. If none, return {"events": []}.

HTML content from ${url}:
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
            });

            extractedEvents = llmRes.events || [];
          }

          sourceResult.eventsFound = extractedEvents.length;
          results.totalFetched += extractedEvents.length;

          if (extractedEvents.length === 0) {
            sourceResult.status = 'needs_manual_setup';
            sourceResult.notes = 'No structured event data detected on page — may require JavaScript rendering or manual event entry';
          }

          for (const evt of extractedEvents) {
            if (!evt.title || !evt.start_time) continue;
            try {
              const startDate = new Date(evt.start_time);
              if (isNaN(startDate.getTime())) continue;

              const normalizedTitle = evt.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
              const normalizedDate = startDate.toISOString().slice(0, 10);
              const syncHash = `${normalizedTitle}_${normalizedDate}`;

              const existing = await base44.asServiceRole.entities.IslandEvent.filter({ sync_hash: syncHash });

              if (existing.length > 0) {
                const existingEvent = existing[0];
                if (existingEvent.admin_override) {
                  sourceResult.duplicates++;
                  results.duplicates++;
                  continue;
                }
                const needsUpdate = existingEvent.title !== evt.title || existingEvent.description !== evt.description;
                if (needsUpdate) {
                  await base44.asServiceRole.entities.IslandEvent.update(existingEvent.id, {
                    title: evt.title,
                    description: evt.description || '',
                    short_description: evt.short_description || (evt.description || '').slice(0, 120),
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
                  sourceResult.eventsUpdated++;
                  results.updatedEvents++;
                } else {
                  sourceResult.duplicates++;
                  results.duplicates++;
                }
              } else {
                await base44.asServiceRole.entities.IslandEvent.create({
                  title: evt.title,
                  description: evt.description || '',
                  short_description: evt.short_description || (evt.description || '').slice(0, 120),
                  category: evt.category || 'community',
                  start_time: startDate.toISOString(),
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
                sourceResult.eventsImported++;
                results.newEvents++;
              }
            } catch (evtErr) {
              results.errors.push(`Event "${evt.title}": ${evtErr.message}`);
            }
          }

          // Log this source's result
          await logSync(base44, source.label, url, sourceResult.status, sourceResult.eventsFound, sourceResult.eventsImported, sourceResult.eventsUpdated, sourceResult.duplicates, sourceResult.error, sourceResult.notes, 'admin_trigger');
        } catch (sourceErr) {
          sourceResult.status = 'failed';
          sourceResult.error = sourceErr.message;
          results.errors.push(`${source.label}: ${sourceErr.message}`);
          await logSync(base44, source.label, url, 'failed', 0, 0, 0, 0, sourceErr.message, '', 'admin_trigger');
        }

        results.sourceResults.push(sourceResult);
      }
    }

    // Remove expired synced events (not admin_override)
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

async function logSync(base44, sourceName, sourceUrl, status, found, imported, updated, duplicates, error, notes, syncType) {
  try {
    await base44.asServiceRole.entities.SyncLog.create({
      source_name: sourceName,
      source_url: sourceUrl,
      status,
      events_found: found,
      events_imported: imported,
      events_updated: updated,
      duplicates_skipped: duplicates,
      error_message: error || '',
      notes: notes || '',
      sync_type: syncType,
    });
  } catch (e) {
    console.error('Failed to create sync log:', e.message);
  }
}

function extractJsonLdEvents(html) {
  const events = [];
  const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdBlocks) {
    const jsonContent = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      const parsed = JSON.parse(jsonContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const candidates = item['@graph'] ? (Array.isArray(item['@graph']) ? item['@graph'] : [item['@graph']]) : [item];
        for (const candidate of candidates) {
          const types = Array.isArray(candidate['@type']) ? candidate['@type'] : [candidate['@type']];
          if (types.some(t => (t || '').toLowerCase().includes('event'))) {
            events.push({
              title: candidate.name || '',
              description: candidate.description || '',
              short_description: (candidate.description || '').slice(0, 120),
              start_time: candidate.startDate || candidate.startdate || '',
              end_time: candidate.endDate || candidate.enddate || null,
              all_day: false,
              location_name: typeof candidate.location === 'string' ? candidate.location : (candidate.location?.name || ''),
              address: '',
              registration_required: false,
              registration_url: '',
              tags: [],
            });
          }
        }
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return events;
}