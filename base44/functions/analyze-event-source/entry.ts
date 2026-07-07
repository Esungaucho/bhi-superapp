import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { url, source_id } = body;
    const targetUrl = url || (source_id ? null : null);

    // If source_id provided, load existing source to re-analyze
    let eventSource = null;
    if (source_id) {
      const sources = await base44.asServiceRole.entities.EventSource.filter({ id: source_id });
      if (sources.length === 0) return Response.json({ error: 'Source not found' }, { status: 404 });
      eventSource = sources[0];
    }

    const fetchUrl = targetUrl || eventSource?.url;
    if (!fetchUrl) return Response.json({ error: 'URL is required' }, { status: 400 });

    // Fetch the page HTML
    const pageRes = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'BHI-SuperApp-EventSync/1.0' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    if (!pageRes.ok) {
      return Response.json({ error: `Failed to fetch URL: HTTP ${pageRes.status}` }, { status: 502 });
    }

    const contentType = pageRes.headers.get('content-type') || '';
    const html = await pageRes.text();
    const finalUrl = pageRes.url; // after redirects

    // Detect structured data
    const detected = analyzeHtml(html, contentType, finalUrl);

    // Use LLM to determine site name, organization, and best strategy
    const truncatedHtml = html.slice(0, 20000);
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an event source analyzer. Analyze this web page and determine:
1. The site/organization name (from title, meta tags, or headings)
2. The best extraction strategy from: "json_ld" (if schema.org Event JSON-LD is present), "ical" (if .ics calendar link found), "rss" (if RSS/Atom feed found), "html_llm" (fallback - parse HTML with AI)
3. A default event category from: family, kids, nature, conservancy, fitness, arts_culture, music, dining, shopping, community, government, weddings, holiday, club_events, member_only, seasonal
4. Brief notes about the page structure (what kind of events, how they're listed, any pagination, etc.)
5. Estimate how many events appear on this page

Technical detection results:
- Has JSON-LD Event schema: ${detected.hasJsonLd}
- Has iCal feed link: ${detected.hasIcal}
- Has RSS/Atom feed: ${detected.hasRss}
- Content-Type: ${contentType}

Page URL: ${finalUrl}
First 20000 chars of HTML:
${truncatedHtml}`,
      response_json_schema: {
        type: 'object',
        properties: {
          site_name: { type: 'string' },
          organization: { type: 'string' },
          best_strategy: { type: 'string', enum: ['json_ld', 'ical', 'rss', 'html_llm'] },
          default_category: { type: 'string' },
          analysis_notes: { type: 'string' },
          estimated_event_count: { type: 'number' },
        },
      },
    });

    // Override strategy if we detected structured data programmatically
    let finalStrategy = llmRes.best_strategy;
    if (detected.hasJsonLd) finalStrategy = 'json_ld';
    else if (detected.hasIcal) finalStrategy = 'ical';
    else if (detected.hasRss) finalStrategy = 'rss';
    else finalStrategy = 'html_llm';

    // Map organization to source enum
    const orgMap = {
      'bald head island': 'bhi_limited',
      'village': 'village_of_bhi',
      'conservancy': 'bhi_conservancy',
      'bald head association': 'bald_head_association',
      'old baldy': 'old_baldy_foundation',
      'shoals': 'shoals_club',
      'bald head island club': 'bhi_club',
    };
    const orgLower = (llmRes.organization || llmRes.site_name || '').toLowerCase();
    let sourceEnum = 'other';
    for (const [key, val] of Object.entries(orgMap)) {
      if (orgLower.includes(key)) { sourceEnum = val; break; }
    }

    // Save or update EventSource
    const sourceData = {
      name: llmRes.site_name || llmRes.organization || new URL(finalUrl).hostname,
      url: fetchUrl,
      organization: llmRes.organization || llmRes.site_name || '',
      source_enum: sourceEnum,
      extraction_strategy: finalStrategy,
      feed_url: detected.icalUrl || detected.rssUrl || null,
      default_category: llmRes.default_category || 'community',
      analysis_notes: llmRes.analysis_notes || '',
      detected_event_count: llmRes.estimated_event_count || 0,
      status: 'analyzed',
      sync_error: null,
    };

    if (eventSource) {
      await base44.asServiceRole.entities.EventSource.update(eventSource.id, sourceData);
      sourceData.id = eventSource.id;
    } else {
      const created = await base44.asServiceRole.entities.EventSource.create(sourceData);
      sourceData.id = created.id;
    }

    return Response.json({
      success: true,
      source: sourceData,
      detected: {
        hasJsonLd: detected.hasJsonLd,
        hasIcal: detected.hasIcal,
        hasRss: detected.hasRss,
        feedUrl: detected.icalUrl || detected.rssUrl,
      },
    });
  } catch (error) {
    console.error('analyze-event-source error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeHtml(html, contentType, pageUrl) {
  const result = { hasJsonLd: false, hasIcal: false, hasRss: false, icalUrl: null, rssUrl: null };

  // Check for JSON-LD Event schema
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      if (jsonContent.toLowerCase().includes('"event"') || jsonContent.toLowerCase().includes('"@type":"event"') || jsonContent.toLowerCase().includes('"@type": "event"')) {
        result.hasJsonLd = true;
        break;
      }
    }
  }

  // Check for iCal links
  const icalLinkMatch = html.match(/href=["']([^"']*\.ics[^"']*)["']/i);
  if (icalLinkMatch) {
    result.hasIcal = true;
    result.icalUrl = resolveUrl(icalLinkMatch[1], pageUrl);
  }
  // Also check for "webcal://" protocol
  const webcalMatch = html.match(/href=["'](webcal:\/\/[^"']*)["']/i);
  if (webcalMatch) {
    result.hasIcal = true;
    result.icalUrl = webcalMatch[1].replace('webcal://', 'https://');
  }

  // Check for RSS/Atom feeds
  const rssLinkMatch = html.match(/<link[^>]*type=["']application\/(?:rss|atom)\+xml["'][^>]*href=["']([^"']*)["']/i);
  if (rssLinkMatch) {
    result.hasRss = true;
    result.rssUrl = resolveUrl(rssLinkMatch[1], pageUrl);
  }

  return result;
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}