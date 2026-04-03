import { fetchWeatherData, fetchWeatherByCoords } from "./api.js";
import { weatherSVGs } from "./icons.js";
import {
  initAnimations,
  clearAnimations,
  playAnimation,
} from "./animations.js";

document.addEventListener("DOMContentLoaded", () => {
  // ── Register Service Worker (PWA) ──
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  // ── DOM refs ──────────────────────────────────────────
  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const spinnerRow = document.getElementById("spinner-row");
  const errorMessage = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");
  const inputWrap = document.getElementById("input-wrap");
  const recentSearchesContainer = document.getElementById("recent-searches");
  const searchScreen = document.getElementById("search-screen");
  const weatherScreen = document.getElementById("weather-screen");
  const backBtn = document.getElementById("back-btn");
  const bgLayer = document.getElementById("bg-layer");
  const canvas = document.getElementById("particle-canvas");
  const btnC = document.getElementById("btn-c");
  const btnF = document.getElementById("btn-f");
  const wxIconWrap = document.getElementById("wx-icon-wrap");
  const cityNameEl = document.getElementById("city-name");
  const countryEl = document.getElementById("weather-country");
  const tempEl = document.getElementById("temperature");
  const descEl = document.getElementById("description");
  const feelsLikeEl = document.getElementById("feels-like");
  const humidityEl = document.getElementById("humidity");
  const windEl = document.getElementById("wind");
  const visibilityEl = document.getElementById("visibility");
  const tempMinEl = document.getElementById("temp-min");
  const tempMaxEl = document.getElementById("temp-max");

  let currentData = null;
  let unit = "c";
  let lastWeatherType = null;

  initAnimations(canvas);

  // ── Compass helper ────────────────────────────────────
  function degToCompass(deg) {
    if (deg == null) return "";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  // ── Weather type detection ────────────────────────────
  function getWeatherType(data) {
    const id = data.weather[0].id;
    const isNight = isNightTime(data);
    if (id >= 200 && id < 300) return "stormy";
    if (id >= 300 && id < 600) return "rainy";
    if (id >= 600 && id < 700) return "snowy";
    if (id >= 700 && id < 800) return "misty";
    if (id === 800) return isNight ? "clear-night" : "clear-day";
    if (id > 800) return "cloudy";
    return "cloudy";
  }

  function isNightTime(data) {
    const now = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    return now < sunrise || now > sunset;
  }

  // ── Premium SVG weather icons ─────────────────────────

  // ── Apply background + effects ────────────────────────
  function applyBackground(type) {
    lastWeatherType = type;
    // Set CSS class on bg layer
    bgLayer.className = "bg-layer " + type;

    clearAnimations();

    // Light theme for snowy / misty
    const lightThemes = ["snowy", "misty"];
    document.body.classList.toggle("theme-light", lightThemes.includes(type));

    // Inject SVG icon (Bug fix: was never updated previously)
    wxIconWrap.innerHTML = weatherSVGs[type] || weatherSVGs["cloudy"];

    playAnimation(type);
  }

  // ── Temperature helpers ───────────────────────────────
  function toF(c) {
    return Math.round((c * 9) / 5 + 32);
  }
  function fmt(c) {
    return unit === "c" ? `${Math.round(c)}°` : `${toF(c)}°`;
  }

  function updateTemps() {
    if (!currentData) return;
    const { main, wind } = currentData;
    tempEl.textContent = fmt(main.temp);
    feelsLikeEl.textContent = fmt(main.feels_like);
    tempMaxEl.textContent = `H: ${fmt(main.temp_max)}`;
    tempMinEl.textContent = `L: ${fmt(main.temp_min)}`;
    // Wind unit matches temperature unit (m/s for metric, mph for imperial)
    const dir = degToCompass(wind.deg);
    windEl.textContent =
      unit === "c"
        ? `${Math.round(wind.speed)} m/s${dir ? " " + dir : ""}`
        : `${Math.round(wind.speed * 2.237)} mph${dir ? " " + dir : ""}`;
  }

  // ── Fetch ─────────────────────────────────────────────

  // ── Display ───────────────────────────────────────────
  function displayWeatherData(data) {
    currentData = data;
    const { name, sys, main, weather, wind, visibility } = data;
    const type = getWeatherType(data);

    applyBackground(type);

    cityNameEl.textContent = name;
    countryEl.textContent = sys.country;
    descEl.textContent = weather[0].description;
    humidityEl.textContent = `${main.humidity}%`;
    visibilityEl.textContent =
      visibility != null ? `${(visibility / 1000).toFixed(1)} km` : "—";

    updateTemps();

    searchScreen.classList.add("hidden");
    weatherScreen.classList.remove("hidden");
    // Re-trigger fade-in animation on every search
    weatherScreen.style.animation = "none";
    weatherScreen.offsetHeight; // force reflow
    weatherScreen.style.animation = "";
  }

  // ── Recent Searches ───────────────────────────────────
  function renderRecentSearches() {
    const searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    recentSearchesContainer.innerHTML = "";
    searches.forEach((city) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "recent-search-item";
      btn.textContent = city;
      btn.onclick = () => {
        cityInput.value = city;
        search();
        recentSearchesContainer.classList.add("hidden");
      };
      recentSearchesContainer.appendChild(btn);
    });
  }

  function addRecentSearch(city) {
    let searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    searches = searches.filter((s) => s.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);
    searches = searches.slice(0, 3);
    localStorage.setItem("recentSearches", JSON.stringify(searches));
    renderRecentSearches();
  }

  // ── Search ────────────────────────────────────────────
  async function search() {
    const city = cityInput.value.trim();
    if (!city) {
      inputWrap.classList.add("error");
      setTimeout(() => inputWrap.classList.remove("error"), 400);
      return;
    }
    getWeatherBtn.disabled = true;
    spinnerRow.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    recentSearchesContainer.classList.add("hidden");

    try {
      const data = await fetchWeatherData(city);
      localStorage.setItem("lastCity", data.name);
      addRecentSearch(data.name);
      displayWeatherData(data);
    } catch (err) {
      if (err.name === "AbortError") return; // stale request — ignore silently
      errorText.textContent = err.message;
      errorMessage.classList.remove("hidden");
    } finally {
      getWeatherBtn.disabled = false;
      spinnerRow.classList.add("hidden");
    }
  }

  // ── Back to search ────────────────────────────────────
  backBtn.addEventListener("click", () => {
    // Bug fix: clean up all effects and reset body theme
    clearAnimations();
    bgLayer.className = "bg-layer";
    document.body.classList.remove("theme-light"); // Bug fix: was persisting
    weatherScreen.classList.add("hidden");
    searchScreen.classList.remove("hidden");
    cityInput.value = "";
    setTimeout(() => cityInput.focus(), 10);
  });

  // ── Unit toggle ───────────────────────────────────────
  btnC.addEventListener("click", () => {
    if (unit === "c") return;
    unit = "c";
    btnC.classList.add("active");
    btnF.classList.remove("active");
    updateTemps();
  });

  btnF.addEventListener("click", () => {
    if (unit === "f") return;
    unit = "f";
    btnF.classList.add("active");
    btnC.classList.remove("active");
    updateTemps();
  });

  // ── Events ────────────────────────────────────────────
  getWeatherBtn.addEventListener("click", () => {
    search();
    recentSearchesContainer.classList.add("hidden");
  });
  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      search();
      recentSearchesContainer.classList.add("hidden");
    }
  });

  cityInput.addEventListener("focus", () => {
    errorMessage.classList.add("hidden");
    if (recentSearchesContainer.children.length > 0) {
      recentSearchesContainer.classList.remove("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== cityInput && !recentSearchesContainer.contains(e.target)) {
      recentSearchesContainer.classList.add("hidden");
    }
  });

  // ── Geolocation ───────────────────────────────────────
  const locateBtn = document.getElementById("locate-btn");
  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      errorText.textContent = "Geolocation not supported.";
      errorMessage.classList.remove("hidden");
      return;
    }
    locateBtn.classList.add("loading");
    getWeatherBtn.disabled = true;
    spinnerRow.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    recentSearchesContainer.classList.add("hidden");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          localStorage.setItem("lastCity", data.name);
          addRecentSearch(data.name);
          cityInput.value = data.name;
          displayWeatherData(data);
        } catch (err) {
          if (err.name === "AbortError") return;
          errorText.textContent = err.message;
          errorMessage.classList.remove("hidden");
        } finally {
          locateBtn.classList.remove("loading");
          getWeatherBtn.disabled = false;
          spinnerRow.classList.add("hidden");
        }
      },
      () => {
        errorText.textContent = "Location access denied.";
        errorMessage.classList.remove("hidden");
        locateBtn.classList.remove("loading");
        getWeatherBtn.disabled = false;
        spinnerRow.classList.add("hidden");
      },
      { timeout: 8000 },
    );
  });

  // Initialize recent searches
  renderRecentSearches();

  // Restore + auto-fetch last searched city
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    search();
  }
});
