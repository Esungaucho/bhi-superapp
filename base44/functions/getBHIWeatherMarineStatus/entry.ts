import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Bald Head Island, NC
const BHI_LAT = 33.86;
const BHI_LON = -78.00;

const WINDY_URL = 'https://api.windy.com/api/point-forecast/v2';

// m/s → mph
function msToMph(ms) {
  if (ms == null || isNaN(ms)) return null;
  return Math.round(ms * 2.23694 * 10) / 10;
}

// K (Kelvin) → °F — Windy API returns temperature in Kelvin
function kToF(k) {
  if (k == null || isNaN(k)) return null;
  return Math.round(((k - 273.15) * 9 / 5 + 32) * 10) / 10;
}

// mm → inches
function mmToIn(mm) {
  if (mm == null || isNaN(mm)) return 0;
  return Math.round(mm * 0.0393701 * 100) / 100;
}

// Wind u/v components → speed (mph) and cardinal direction
function windFromUV(u, v) {
  if (u == null || v == null || (isNaN(u) && isNaN(v))) return { speed: null, direction: '' };
  const speedMs = Math.sqrt(u * u + v * v);
  // Meteorological wind direction (where wind comes FROM)
  let deg = (Math.atan2(u, v) * 180 / Math.PI + 180) % 360;
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const direction = dirs[Math.round(deg / 22.5) % 16];
  return { speed: msToMph(speedMs), direction };
}

// Find the array index closest to "now"
function currentIndex(tsArray) {
  const now = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < tsArray.length; i++) {
    const diff = Math.abs(tsArray[i] - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// Sum precipitation over next N hours starting from current index
function sumPrecip(precipArray, startIdx, hours) {
  if (!precipArray || !Array.isArray(precipArray)) return 0;
  const count = Math.min(hours, precipArray.length - startIdx);
  let total = 0;
  for (let i = startIdx; i < startIdx + count; i++) {
    if (precipArray[i] != null) total += precipArray[i];
  }
  return mmToIn(total);
}

// ── Status derivations ──

function ferryComfort(windMph, gustMph) {
  const maxWind = Math.max(windMph || 0, gustMph || 0);
  if (maxWind < 12) return { label: 'Calm', tone: 'great' };
  if (maxWind < 20) return { label: 'Breezy', tone: 'okay' };
  if (maxWind < 30) return { label: 'Choppy', tone: 'caution' };
  return { label: 'Rough', tone: 'avoid' };
}

function beachDayStatus(tempF, windMph, rainIn) {
  if (rainIn > 0.3) return { label: 'Rainy', tone: 'avoid' };
  if (tempF != null && tempF < 55) return { label: 'Not ideal', tone: 'avoid' };
  if (windMph >= 20) return { label: 'Windy', tone: 'caution' };
  if (tempF != null && tempF >= 75 && rainIn < 0.1 && windMph < 15) return { label: 'Great', tone: 'great' };
  return { label: 'Okay', tone: 'okay' };
}

function boatingStatus(windMph, gustMph, waveFt) {
  const maxWind = Math.max(windMph || 0, gustMph || 0);
  if (maxWind < 12 && (waveFt == null || waveFt < 3)) return { label: 'Good', tone: 'great' };
  if (maxWind < 20 && (waveFt == null || waveFt < 5)) return { label: 'Caution', tone: 'caution' };
  return { label: 'Avoid', tone: 'avoid' };
}

// Generate plain-language summary
function buildSummary(tempF, windMph, gustMph, windDir, rainIn, ferry, beach, boating) {
  const tempWord = tempF == null ? 'mild' : tempF >= 80 ? 'warm' : tempF >= 65 ? 'pleasant' : tempF >= 55 ? 'cool' : 'chilly';
  const windWord = windMph == null ? 'a light breeze' : windMph < 8 ? 'a light breeze' : windMph < 15 ? 'a gentle breeze' : windMph < 25 ? 'breezy conditions' : 'strong winds';
  const ferryDesc = ferry.tone === 'great' ? 'comfortable' : ferry.tone === 'okay' ? 'manageable' : ferry.tone === 'caution' ? 'a bit choppy' : 'rough';

  let rainClause = '';
  if (rainIn > 0.3) rainClause = ' Rain is expected, so plan accordingly.';
  else if (rainIn > 0.05) rainClause = ' A slight chance of rain — keep an umbrella handy.';

  let beachClause = '';
  if (beach.tone === 'great') beachClause = ' Best beach window is late morning to early afternoon.';
  else if (beach.tone === 'avoid') beachClause = ' Beach conditions are not ideal today.';

  return `Today on Bald Head: ${tempWord} with ${windWord}${windDir ? ' from the ' + windDir : ''}. Ferry ride should be ${ferryDesc}.${rainClause}${beachClause}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('WINDY_API_KEY');
    if (!apiKey) {
      console.error('WINDY_API_KEY not set');
      return Response.json({ error: 'Weather service not configured' }, { status: 503 });
    }

    // ── Fetch weather forecast (GFS model) ──
    const weatherBody = {
      lat: BHI_LAT,
      lon: BHI_LON,
      model: 'gfs',
      parameters: ['temp', 'wind', 'windGust', 'precip', 'rh'],
      levels: ['surface'],
      key: apiKey,
    };

    // ── Fetch marine forecast (wave model) ──
    const marineBody = {
      lat: BHI_LAT,
      lon: BHI_LON,
      model: 'gfsWave',
      parameters: ['waves'],
      levels: ['surface'],
      key: apiKey,
    };

    const [weatherRes, marineRes] = await Promise.all([
      fetch(WINDY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weatherBody),
      }),
      fetch(WINDY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marineBody),
      }),
    ]);

    if (!weatherRes.ok) {
      console.error('Windy weather API error:', weatherRes.status, await weatherRes.text());
      return Response.json({ error: 'Weather data unavailable' }, { status: 502 });
    }

    const weatherData = await weatherRes.json();
    let waveData = null;
    if (marineRes.ok) {
      try { waveData = await marineRes.json(); } catch (_) { /* wave optional */ }
    }

    // ── Extract current values ──
    const ts = weatherData.ts || [];
    const idx = currentIndex(ts);

    const tempC = weatherData['temp-surface']?.[idx];
    const windU = weatherData['wind_u-surface']?.[idx];
    const windV = weatherData['wind_v-surface']?.[idx];
    const gustMs = weatherData['gust-surface']?.[idx];
    const precipArray = weatherData['past3hprecip-surface'] || weatherData['past1hprecip-surface'];
    const rh = weatherData['rh-surface']?.[idx];

    const { speed: windMph, direction: windDir } = windFromUV(windU, windV);
    const gustMph = msToMph(gustMs);
    const tempF = kToF(tempC);
    const rainInches = sumPrecip(precipArray, idx, 12); // next 12 hours

    // Wave height (m → ft)
    let waveFt = null;
    if (waveData && waveData['waves-surface']) {
      const waveM = waveData['waves-surface'][idx];
      if (waveM != null) waveFt = Math.round(waveM * 3.28084 * 10) / 10;
    }

    // ── Derive statuses ──
    const ferry = ferryComfort(windMph, gustMph);
    const beach = beachDayStatus(tempF, windMph, rainInches);
    const boating = boatingStatus(windMph, gustMph, waveFt);
    const summary = buildSummary(tempF, windMph, gustMph, windDir, rainInches, ferry, beach, boating);

    return Response.json({
      summary,
      current: {
        temp_f: tempF,
        wind_mph: windMph,
        wind_gust_mph: gustMph,
        wind_direction: windDir,
        rain_in_next_12h: rainInches,
        humidity_pct: rh != null ? Math.round(rh) : null,
        wave_height_ft: waveFt,
      },
      statuses: { ferry, beach, boating },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('getBHIWeatherMarineStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});