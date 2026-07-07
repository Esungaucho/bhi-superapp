import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Bald Head Island coordinates
const BHI_LAT = 33.8575;
const BHI_LON = -78.0031;

// NOAA Tides & Currents — station at Bald Head Island, Cape Fear River, NC
const NOAA_TIDE_STATION = '8658901';

const NWS_HEADERS = {
  'User-Agent': 'BHI-SuperApp/1.0 (weather@bhisuperapp.com)',
  'Accept': 'application/geo+json',
};

// Convert wind direction in degrees to cardinal direction
function degreesToCardinal(deg) {
  if (deg == null || isNaN(deg)) return '';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Map NWS textDescription to our condition enum
function mapCondition(text) {
  if (!text) return 'partly_cloudy';
  const t = text.toLowerCase();
  if (t.includes('clear') || t.includes('sunny')) return 'sunny';
  if (t.includes('partly') || t.includes('a few clouds')) return 'partly_cloudy';
  if (t.includes('mostly cloudy')) return 'partly_cloudy';
  if (t.includes('cloudy') || t.includes('overcast')) return 'cloudy';
  if (t.includes('thunder') || t.includes('storm')) return 'storm';
  if (t.includes('rain') || t.includes('shower') || t.includes('drizzle')) return 'rain';
  if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'foggy';
  return 'partly_cloudy';
}

// C to F conversion (NWS returns Celsius)
function cToF(c) {
  if (c == null || isNaN(c)) return null;
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

// km/h to mph conversion
function kmhToMph(kmh) {
  if (kmh == null || isNaN(kmh)) return null;
  return Math.round(kmh * 0.621371);
}

// Format a UTC Date as YYYYMMDD for NOAA API
function formatDateForNOAA(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Format a Date as Eastern time "H:MM AM/PM"
function formatTideTimeEST(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Fetch tide predictions from NOAA and derive current status + next event
async function fetchTideData() {
  const now = new Date();
  const today = formatDateForNOAA(now);
  const tomorrow = formatDateForNOAA(new Date(now.getTime() + 86400000));

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${NOAA_TIDE_STATION}&begin_date=${today}&end_date=${tomorrow}&product=predictions&datum=mllw&units=english&time_zone=gmt&interval=hilo&format=json`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('NOAA Tides API error:', res.status);
    return null;
  }
  const data = await res.json();
  if (!data.predictions || data.predictions.length === 0) {
    console.error('NOAA Tides: no predictions returned', data?.error || '');
    return null;
  }

  // Parse predictions — NOAA returns "2024-01-01 03:21" in GMT
  const predictions = data.predictions.map(p => ({
    time: new Date(p.t.replace(' ', 'T') + ':00Z'),
    type: p.type, // "H" = High, "L" = Low
  }));

  // Find the last event before now and the next event after now
  let lastEvent = null;
  let nextEvent = null;
  for (const pred of predictions) {
    if (pred.time <= now) {
      lastEvent = pred;
    } else if (!nextEvent) {
      nextEvent = pred;
      break;
    }
  }

  if (!lastEvent && !nextEvent) return null;

  const THIRTY_MIN = 30 * 60 * 1000;
  let tide_status;

  if (nextEvent && (nextEvent.time - now) < THIRTY_MIN) {
    // Approaching next event
    tide_status = nextEvent.type === 'H' ? 'high' : 'low';
  } else if (lastEvent && (now - lastEvent.time) < THIRTY_MIN) {
    // Just passed an event
    tide_status = lastEvent.type === 'H' ? 'high' : 'low';
  } else if (lastEvent && nextEvent) {
    // Between two events — rising or falling
    if (lastEvent.type === 'L' && nextEvent.type === 'H') {
      tide_status = 'rising';
    } else if (lastEvent.type === 'H' && nextEvent.type === 'L') {
      tide_status = 'falling';
    } else {
      tide_status = lastEvent.type === 'H' ? 'high' : 'low';
    }
  } else if (nextEvent) {
    tide_status = 'rising'; // before first event of the day
  } else {
    tide_status = lastEvent?.type === 'H' ? 'falling' : 'rising';
  }

  // Build next event description in Eastern time
  const event = nextEvent || lastEvent;
  const tideLabel = event?.type === 'H' ? 'High' : 'Low';
  const tide_next_event = event ? `${tideLabel} tide at ${formatTideTimeEST(event.time)}` : null;

  return { tide_status, tide_next_event };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Step 1: Get gridpoint metadata for BHI
    const pointsRes = await fetch(
      `https://api.weather.gov/points/${BHI_LAT},${BHI_LON}`,
      { headers: NWS_HEADERS }
    );
    if (!pointsRes.ok) {
      console.error('NWS points API error:', pointsRes.status, await pointsRes.text());
      return Response.json({ error: `NWS points API returned ${pointsRes.status}` }, { status: 502 });
    }
    const pointsData = await pointsRes.json();
    const observationStationsUrl = pointsData?.properties?.observationStations;

    if (!observationStationsUrl) {
      return Response.json({ error: 'No observation stations found' }, { status: 502 });
    }

    // Step 2: Get list of observation stations
    const stationsRes = await fetch(observationStationsUrl, { headers: NWS_HEADERS });
    if (!stationsRes.ok) {
      console.error('NWS stations API error:', stationsRes.status);
      return Response.json({ error: `NWS stations API returned ${stationsRes.status}` }, { status: 502 });
    }
    const stationsData = await stationsRes.json();
    const stationId = stationsData?.features?.[0]?.properties?.stationIdentifier;

    if (!stationId) {
      return Response.json({ error: 'No station identifier found' }, { status: 502 });
    }

    // Step 3: Get latest observation from the first station
    const obsRes = await fetch(
      `https://api.weather.gov/stations/${stationId}/observations/latest`,
      { headers: NWS_HEADERS }
    );
    if (!obsRes.ok) {
      console.error('NWS observation API error:', obsRes.status);
      return Response.json({ error: `NWS observation API returned ${obsRes.status}` }, { status: 502 });
    }
    const obsData = await obsRes.json();
    const props = obsData?.properties;

    if (!props) {
      return Response.json({ error: 'No observation data' }, { status: 502 });
    }

    // Map NWS fields to IslandConditions
    const temp_f = cToF(props.temperature?.value);
    const feels_like_f = cToF(props.heatIndex?.value) ?? cToF(props.windChill?.value) ?? temp_f;

    // Preserve manual fields (wave, crowd, beach flag, water temp, UV) from the previous record
    const previous = await base44.asServiceRole.entities.IslandConditions.list('-recorded_at', 1);
    const prev = previous[0] || {};

    // Fetch live tide data from NOAA
    const tideData = await fetchTideData();

    const newRecord = {
      recorded_at: new Date().toISOString(),
      temp_f: temp_f ?? prev.temp_f,
      feels_like_f: feels_like_f ?? prev.feels_like_f,
      humidity_pct: props.relativeHumidity?.value != null
        ? Math.round(props.relativeHumidity.value)
        : prev.humidity_pct,
      wind_mph: kmhToMph(props.windSpeed?.value) ?? prev.wind_mph,
      wind_direction: degreesToCardinal(props.windDirection?.value) || prev.wind_direction,
      uv_index: prev.uv_index,
      wave_height_ft: prev.wave_height_ft,
      tide_status: tideData?.tide_status || prev.tide_status,
      tide_next_event: tideData?.tide_next_event || prev.tide_next_event,
      crowd_level: prev.crowd_level || 'moderate',
      condition: mapCondition(props.textDescription),
      water_temp_f: prev.water_temp_f,
      beach_flag: prev.beach_flag || 'green',
      is_current: true,
    };

    // Mark previous records as not current
    if (previous.length > 0) {
      await base44.asServiceRole.entities.IslandConditions.updateMany(
        { is_current: true },
        { $set: { is_current: false } }
      );
    }

    const created = await base44.asServiceRole.entities.IslandConditions.create(newRecord);

    return Response.json({
      status: 'success',
      station: stationId,
      recorded_at: created.recorded_at,
      temp_f: created.temp_f,
      condition: created.condition,
      humidity_pct: created.humidity_pct,
      wind_mph: created.wind_mph,
      wind_direction: created.wind_direction,
      tide_status: created.tide_status,
      tide_next_event: created.tide_next_event,
    });
  } catch (error) {
    console.error('fetch-weather error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});