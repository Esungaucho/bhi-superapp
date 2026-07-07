import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OFFICIAL_SOURCES = [
  {
    key: 'bhi_limited',
    label: 'Bald Head Island Limited',
    type: 'html',
    urls: ['https://www.baldheadisland.com/events-news'],
    default_category: 'community',
  },
  {
    key: 'village_of_bhi',
    label: 'Village of Bald Head Island',
    type: 'html',
    urls: ['https://villagebhi.org/residents-owners/view/village-calendar/'],
    default_category: 'government',
  },
  {
    key: 'bhi_conservancy',
    label: 'BHI Conservancy',
    type: 'html',
    urls: ['https://bhic.org/calendar/'],
    default_category: 'conservancy',
  },
  {
    key: 'bald_head_association',
    label: 'Bald Head Association',
    type: 'html',
    urls: ['https://www.baldheadassociation.com/calendar-bha'],
    default_category: 'community',
  },
  {
    key: 'old_baldy_foundation',
    label: 'Old Baldy Foundation',
    type: 'html',
    urls: ['https://www.oldbaldy.org/events'],
    default_category: 'arts_culture',
  },
  {
    key: 'village_chapel',
    label: 'Village Chapel of Bald Head Island',
    type: 'html',
    urls: ['https://www.villagechapelofbaldheadisland.com/calendars.html'],
    default_category: 'community',
  },
  {
    key: 'bhi_club',
    label: 'Bald Head Island Club',
    type: 'pdf',
    urls: ['https://www.bhiclub.net/documents/20124/173104/BHI+Club+Public+Events+Cal+%282%29.pdf/b25a8906-6e91-713d-f524-40b94be3c31b?t=1780772669317'],
    default_category: 'club_events',
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const sourceKey = body.source_key || null;

    const sourcesToSync = sourceKey
      ? OFFICIAL_SOURCES.filter(s => s.key === sourceKey)
      : OFFICIAL_SOURCES;

    if (sourceKey && sourcesToSync.length === 0) {
      return Response.json({ error: `Unknown source: ${sourceKey}` }, { status: 400 });
    }

    const syncType = sourceKey ? 'per_source' : 'admin_trigger';
    const results = { totalFetched: 0, newEvents: 0, updatedEvents: 0, duplicates: 0, totalFailed: 0, sourceResults: [] };
    const now = new Date();

    for (const source of sourcesToSync) {
      for (const url of source.urls) {
        const sourceResult = {
          source_key: source.key,
          source: source.label,
          url,
          status: 'connected',
          extraction_method: 'auto',
          eventsFound: 0,
          eventsImported: 0,
          eventsUpdated: 0,
          eventsFailed: 0,
          duplicates: 0,
          error: null,
          notes: '',
        };

        try {
          let extractedEvents = [];

          if (source.type === 'pdf') {
            sourceResult.extraction_method = 'llm_pdf';
            extractedEvents = await extractPdfEvents(base44, url, source, now);
          } else {
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
              await logSync(base44, source, url, sourceResult, syncType);
              results.sourceResults.push(sourceResult);
              continue;
            }

            const html = await pageRes.text();
            if (!html || html.length < 500) {
              sourceResult.status = 'needs_manual_setup';
              sourceResult.notes = 'Page returned no usable content — may require JavaScript rendering or manual event entry';
              await logSync(base44, source, url, sourceResult, syncType);
              results.sourceResults.push(sourceResult);
              continue;
            }

            // Try JSON-LD first
            extractedEvents = extractJsonLdEvents(html);
            sourceResult.extraction_method = extractedEvents.length > 0 ? 'json_ld' : 'llm_html';

            // Fallback to LLM extraction
            if (extractedEvents.length === 0) {
              extractedEvents = await extractHtmlEventsWithLLM(base44, html, url, source, now);
            }
          }

          sourceResult.eventsFound = extractedEvents.length;
          results.totalFetched += extractedEvents.length;

          if (extractedEvents.length === 0) {
            sourceResult.status = 'needs_manual_setup';
            sourceResult.notes = 'No structured event data detected — may require JavaScript rendering or manual event entry';
          }

          for (const evt of extractedEvents) {
            if (!evt.title || !evt.start_time) {
              sourceResult.eventsFailed++;
              results.totalFailed++;
              continue;
            }
            try {
              const startDate = new Date(evt.start_time);
              if (isNaN(startDate.getTime())) {
                sourceResult.eventsFailed++;
                results.totalFailed++;
                continue;
              }

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
                  category: evt.category || source.default_category,
                  start_time: startDate.toISOString(),
                  end_time: evt.end_time || null,
                  all_day: evt.all_day || false,
                  is_all_day: evt.all_day || false,
                  location_name: evt.location_name || '',
                  address: evt.address || '',
                  organization: source.label,
                  source: source.key,
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
              sourceResult.eventsFailed++;
              results.totalFailed++;
            }
          }

          // If some events imported but some failed, mark as requires_admin_review
          if (sourceResult.eventsImported > 0 && sourceResult.eventsFailed > 0) {
            sourceResult.status = 'requires_admin_review';
            sourceResult.notes = `${sourceResult.eventsFailed} event(s) could not be imported`;
          }

          await logSync(base44, source, url, sourceResult, syncType);
        } catch (sourceErr) {
          sourceResult.status = 'failed';
          sourceResult.error = sourceErr.message;
          await logSync(base44, source, url, sourceResult, syncType);
        }

        results.sourceResults.push(sourceResult);
      }
    }

    // Remove expired synced events (not admin_override) only on full sync
    if (!sourceKey) {
      const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const expiredEvents = await base44.asServiceRole.entities.IslandEvent.filter({
        start_time: { $lt: expiredCutoff },
        admin_override: { $ne: true },
      });
      for (const evt of expiredEvents) {
        await base44.asServiceRole.entities.IslandEvent.delete(evt.id);
      }
      results.expiredRemoved = expiredEvents.length;
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('sync-island-events error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function logSync(base44, source, sourceUrl, result, syncType) {
  try {
    await base44.asServiceRole.entities.SyncLog.create({
      source_name: source.label,
      source_key: source.key,
      source_url: sourceUrl,
      status: result.status,
      events_found: result.eventsFound,
      events_imported: result.eventsImported,
      events_updated: result.eventsUpdated,
      events_failed: result.eventsFailed,
      duplicates_skipped: result.duplicates,
      extraction_method: result.extraction_method || 'auto',
      error_message: result.error || '',
      notes: result.notes || '',
      sync_type: syncType,
    });
  } catch (e) {
    console.error('Failed to create sync log:', e.message);
  }
}

async function extractHtmlEventsWithLLM(base44, html, url, source, now) {
  const truncatedHtml = html.slice(0, 30000);
  const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an event extraction system. Extract ONLY real, actual events that appear on this HTML page from ${source.label}.

CRITICAL RULES:
- Only extract events that are explicitly listed on this page with their real title and date.
- Do NOT invent, guess, or fabricate any event details.
- If a title or date is not clearly present for an event, skip it.
- If the page does not contain any actual events, return an empty array.
- Never generate fictional events.
- Only include events with start_time on or after ${now.toISOString()}.
- Use ${now.getFullYear()} for dates unless the page specifies a different year.

Each event must include: title, description (from the page, or empty string), short_description, category (one of: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal), start_time (ISO 8601 datetime), end_time (ISO 8601 or null), all_day (boolean), location_name (from the page or empty string), address (from the page or empty string), registration_required (boolean), registration_url (from the page or empty string), tags (array).

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
  return llmRes.events || [];
}

async function extractPdfEvents(base44, pdfUrl, source, now) {
  const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an event extraction system. Extract ONLY real, actual events from this PDF event calendar from ${source.label}.

CRITICAL RULES:
- Only extract events that are explicitly listed in this PDF with their real title and date.
- Do NOT invent, guess, or fabricate any event details.
- If a title or date is not clearly present for an event, skip it.
- If the PDF does not contain any actual events, return an empty array.
- Never generate fictional events.
- Only include events with start_time on or after ${now.toISOString()}.
- Use the year from the PDF or ${now.getFullYear()}.

Each event must include: title, description (from the PDF, or empty string), short_description, category (one of: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal), start_time (ISO 8601 datetime), end_time (ISO 8601 or null), all_day (boolean), location_name (from the PDF or "Bald Head Island Club"), address (from the PDF or empty string), registration_required (boolean), registration_url (empty string), tags (array).

Return ONLY events actually present in this PDF. If none, return {"events": []}.`,
    file_urls: [pdfUrl],
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
  return llmRes.events || [];
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