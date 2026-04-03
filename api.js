let abortCtrl = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function fetchWeatherData(city) {
  const cacheKey = `wx_cache_city_${city.toLowerCase().trim()}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data; // Return instantly from cache
      }
    } catch (e) {
      // Ignore parsing errors and fetch normally
    }
  }

  // Cancel any previous in-flight request
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  const url = `/api/weather?city=${encodeURIComponent(city)}`;

  const res = await fetch(url, { signal: abortCtrl.signal });
  if (res.status === 404) throw new Error("City not found.");
  if (res.status === 401) throw new Error("Invalid API key.");
  if (!res.ok) throw new Error("Something went wrong.");

  const data = await res.json();

  // Save to cache
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({ timestamp: Date.now(), data }),
  );

  return data;
}

export async function fetchWeatherByCoords(lat, lon) {
  const cacheKey = `wx_cache_coords_${lat}_${lon}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (e) {
      // Ignore parsing errors and fetch normally
    }
  }

  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  const url = `/api/weather?lat=${lat}&lon=${lon}`;

  const res = await fetch(url, { signal: abortCtrl.signal });
  if (res.status === 401) throw new Error("Invalid API key.");
  if (!res.ok) throw new Error("Location weather unavailable.");

  const data = await res.json();

  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({ timestamp: Date.now(), data }),
  );

  return data;
}
