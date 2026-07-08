// Approximate sunset/sunrise times for Bald Head Island (33.87°N, 78.00°W) by month
// Times account for DST (EDT = UTC-4 in summer, EST = UTC-5 in winter)
const SUN_DATA = [
  { sunsetH: 17, sunsetM: 28, sunriseH: 7,  sunriseM: 18 }, // Jan
  { sunsetH: 17, sunsetM: 58, sunriseH: 6,  sunriseM: 58 }, // Feb
  { sunsetH: 19, sunsetM: 22, sunriseH: 7,  sunriseM: 22 }, // Mar (DST starts)
  { sunsetH: 19, sunsetM: 47, sunriseH: 6,  sunriseM: 45 }, // Apr
  { sunsetH: 20, sunsetM: 12, sunriseH: 6,  sunriseM: 16 }, // May
  { sunsetH: 20, sunsetM: 26, sunriseH: 6,  sunriseM: 6 }, // Jun
  { sunsetH: 20, sunsetM: 25, sunriseH: 6,  sunriseM: 11 }, // Jul
  { sunsetH: 19, sunsetM: 55, sunriseH: 6,  sunriseM: 32 }, // Aug
  { sunsetH: 19, sunsetM: 19, sunriseH: 6,  sunriseM: 51 }, // Sep
  { sunsetH: 18, sunsetM: 30, sunriseH: 7,  sunriseM: 15 }, // Oct (DST ends)
  { sunsetH: 17, sunsetM: 06, sunriseH: 6,  sunriseM: 46 }, // Nov
  { sunsetH: 17, sunsetM: 04, sunriseH: 7,  sunriseM: 10 }, // Dec
];

function getTimeForToday(hour, minute) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
}

export function getSunsetTime() {
  const month = new Date().getMonth();
  const data = SUN_DATA[month];
  return getTimeForToday(data.sunsetH, data.sunsetM);
}

export function getSunriseTime() {
  const month = new Date().getMonth();
  const data = SUN_DATA[month];
  return getTimeForToday(data.sunriseH, data.sunriseM);
}

export function getSunsetCountdown() {
  const sunset = getSunsetTime();
  const now = new Date();
  const diff = sunset - now;
  if (diff <= 0) return null;
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
}

export function formatSunsetTime() {
  const sunset = getSunsetTime();
  return sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}