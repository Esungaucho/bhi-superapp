import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { source_id } = body;
    if (!source_id) return Response.json({ error: 'source_id is required' }, { status: 400 });

    // Load the EventSource
    const sources = await base44.asServiceRole.entities.EventSource.filter({ id: source_id });
    if (sources.length === 0) return Response.json({ error: 'Source not found' }, { status: 404 });
    const source = sources[0];

    if (source.status === 'error' && !body.force) {
      return Response.json({ error: 'Source is in error state. Use force=true to retry.' }, { status: 400 });
    }

    const results = { totalFetched: 0, newEvents: 0, updatedEvents: 0, duplicates: 0, errors: [] };
    const now = new Date();
    const fetchUrl = source.feed_url || source.url;

    // Update status to active
    await base44.asServiceRole.entities.EventSource.update(source.id, { status: 'active', sync_error: null });

    try {
      const pageRes = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'BHI-SuperApp-EventSync/1.0' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      if (!pageRes.ok) {
        throw new Error(`HTTP ${pageRes.status} from ${fetchUrl}`);
      }
      const html = await pageRes.text();
      if (!html || html.length < 200) {
        throw new Error('No content received from URL');
      }

      let extractedEvents = [];

      // Strategy dispatch
      if (source.extraction_strategy === 'json_ld') {
        extractedEvents = extractJsonLdEvents(html, fetchUrl);
      } else if (source.extraction_strategy === 'ical') {
        extractedEvents = extractIcalEvents(html);
      } else if (source.extraction_strategy === 'rss') {
        extractedEvents = await extractRssEvents(html, fetchUrl, base44);
      } else {
        // html_llm — use LLM extraction
        extractedEvents = await extractWithLLM(html, source, now, base44);
      }

      // Fallback: if structured extraction found nothing, try LLM
      if (extractedEvents.length === 0 && source.extraction_strategy !== 'html_llm') {
        console.log(`Strategy ${source.extraction_strategy} yielded 0 events, falling back to LLM...`);
        extractedEvents = await extractWithLLM(html, source, now, base44);
      }

      results.totalFetched = extractedEvents.length;

      // Map and upsert events
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
              results.duplicates++;
              continue;
            }
            const needsUpdate =
              existingEvent.title !== evt.title ||
              existingEvent.description !== evt.description;

            if (needsUpdate) {
              await base44.asServiceRole.entities.IslandEvent.update(existingEvent.id, {
                title: evt.title,
                description: evt.description,
                short_description: evt.short_description || (evt.description || '').slice(0, 120),
                end_time: evt.end_time || null,
                all_day: evt.all_day || false,
                is_all_day: evt.all_day || false,
                location_name: evt.location_name || '',
                address: evt.address || '',
                registration_required: evt.registration_required || false,
                registration_url: evt.registration_url || '',
                tags: evt.tags || source.tags_hint || [],
                source_url: source.url,
                last_synced: now.toISOString(),
              });
              results.updatedEvents++;
            } else {
              results.duplicates++;
            }
          } else {
            await base44.asServiceRole.entities.IslandEvent.create({
              title: evt.title,
              description: evt.description || '',
              short_description: evt.short_description || (evt.description || '').slice(0, 120),
              category: evt.category || source.default_category || 'community',
              start_time: startDate.toISOString(),
              end_time: evt.end_time || null,
              all_day: evt.all_day || false,
              is_all_day: evt.all_day || false,
              location_name: evt.location_name || '',
              address: evt.address || '',
              organization: source.organization || source.name,
              source: source.source_enum || 'other',
              source_url: source.url,
              source_name: source.organization || source.name,
              registration_required: evt.registration_required || false,
              registration_url: evt.registration_url || '',
              tags: evt.tags || source.tags_hint || [],
              featured: false,
              is_featured: false,
              status: 'synced',
              sync_hash: syncHash,
              last_synced: now.toISOString(),
            });
            results.newEvents++;
          }
        } catch (evtErr) {
          results.errors.push(`Event "${evt.title}": ${evtErr.message}`);
        }
      }
    } catch (fetchErr) {
      results.errors.push(fetchErr.message);
      await base44.asServiceRole.entities.EventSource.update(source.id, {
        status: 'error',
        sync_error: fetchErr.message,
        last_synced: now.toISOString(),
        last_sync_result: JSON.stringify(results),
      });
      return Response.json({ success: false, ...results, error: fetchErr.message }, { status: 200 });
    }

    // Update source with sync results
    await base44.asServiceRole.entities.EventSource.update(source.id, {
      status: 'active',
      sync_error: null,
      last_synced: now.toISOString(),
      last_sync_result: JSON.stringify(results),
      total_synced: (source.total_synced || 0) + results.newEvents,
    });

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('sync-event-source error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── JSON-LD Extraction ───
function extractJsonLdEvents(html, sourceUrl) {
  const events = [];
  const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const block of jsonLdBlocks) {
    const jsonContent = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      const parsed = JSON.parse(jsonContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        // Handle @graph arrays
        const candidates = item['@graph'] ? (Array.isArray(item['@graph']) ? item['@graph'] : [item['@graph']]) : [item];
        for (const candidate of candidates) {
          const types = Array.isArray(candidate['@type']) ? candidate['@type'] : [candidate['@type']];
          if (types.some(t => (t || '').toLowerCase().includes('event'))) {
            events.push(mapJsonLdEvent(candidate, sourceUrl));
          }
        }
      }
    } catch {
      // Skip invalid JSON blocks
    }
  }
  return events;
}

function mapJsonLdEvent(item, sourceUrl) {
  const startDate = item.startDate || item.startdate || '';
  const endDate = item.endDate || item.enddate || null;
  const loc = item.location || {};
  const locName = typeof loc === 'string' ? loc : (loc.name || '');
  const locAddress = typeof loc === 'object' && loc.address ? (typeof loc.address === 'string' ? loc.address : `${loc.address.streetAddress || ''} ${loc.address.addressLocality || ''} ${loc.address.addressRegion || ''}`.trim()) : '';

  return {
    title: item.name || 'Untitled Event',
    description: item.description || '',
    short_description: (item.description || '').slice(0, 120),
    start_time: startDate,
    end_time: endDate,
    all_day: false,
    location_name: locName,
    address: locAddress,
    registration_required: false,
    registration_url: '',
    tags: [],
  };
}

// ─── iCal Extraction ───
function extractIcalEvents(icalText) {
  const events = [];
  const vevents = icalText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/gi) || [];

  for (const block of vevents) {
    const getProp = (key) => {
      const m = block.match(new RegExp(`^${key}[^:\\n]*(?::|;)(.*)`, 'im'));
      return m ? m[1].replace(/\\n/g, '\n').replace(/\\,/g, ',').trim() : null;
    };
    const summary = getProp('SUMMARY');
    const dtStart = getProp('DTSTART') || getProp('DTSTART;VALUE=DATE');
    const dtEnd = getProp('DTEND') || getProp('DTEND;VALUE=DATE');
    const description = getProp('DESCRIPTION');
    const location = getProp('LOCATION');

    if (summary && dtStart) {
      events.push({
        title: summary,
        description: description || '',
        short_description: (description || summary).slice(0, 120),
        start_time: parseIcalDate(dtStart),
        end_time: dtEnd ? parseIcalDate(dtEnd) : null,
        all_day: (dtStart || '').length === 8,
        location_name: location || '',
        address: '',
        registration_required: false,
        registration_url: '',
        tags: [],
      });
    }
  }
  return events;
}

function parseIcalDate(dt) {
  if (!dt) return null;
  // Format: YYYYMMDD or YYYYMMDDTHHMMSSZ
  const m = dt.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?Z?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString();
}

// ─── RSS Extraction ───
async function extractRssEvents(html, sourceUrl, base44) {
  const events = [];
  const items = html.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const item of items) {
    const getText = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : null;
    };
    const title = getText('title');
    const link = getText('link');
    const description = getText('description');
    const pubDate = getText('pubDate');

    if (title && pubDate) {
      const dt = new Date(pubDate);
      if (!isNaN(dt.getTime())) {
        events.push({
          title,
          description: description || '',
          short_description: (description || title).slice(0, 120),
          start_time: dt.toISOString(),
          end_time: null,
          all_day: false,
          location_name: '',
          address: '',
          registration_required: false,
          registration_url: link || '',
          tags: [],
        });
      }
    }
  }
  return events;
}

// ─── LLM Extraction ───
async function extractWithLLM(html, source, now, base44) {
  const truncatedHtml = html.slice(0, 30000);
  const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an event extraction system. Extract all upcoming events from this HTML page content from ${source.organization || source.name}. Return an array of events. Each event should have: title, description, short_description (1 sentence), category (one of: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal), start_time (ISO 8601 datetime), end_time (ISO 8601 datetime or null), all_day (boolean), location_name, address, registration_required (boolean), registration_url, tags (array of strings). Only include events that have a clear title and date. If no events found, return empty array. Focus on upcoming events only (from ${now.toISOString()} onwards).

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
  return llmRes.events || [];
}