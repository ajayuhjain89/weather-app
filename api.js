let abortCtrl = null;

  export async function fetchWeatherData(city) {
    // Cancel any previous in-flight request
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const url = `/api/weather?city=${encodeURIComponent(city)}`;
    const res = await fetch(url, { signal: abortCtrl.signal });
    if (res.status === 404) throw new Error("City not found.");
    if (res.status === 401) throw new Error("Invalid API key.");
    if (!res.ok) throw new Error("Something went wrong.");
    return res.json();
  }

  export async function fetchWeatherByCoords(lat, lon) {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const url = `/api/weather?lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { signal: abortCtrl.signal });
    if (res.status === 401) throw new Error("Invalid API key.");
    if (!res.ok) throw new Error("Location weather unavailable.");
    return res.json();
  }
