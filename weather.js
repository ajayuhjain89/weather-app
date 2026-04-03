import { fetchWeatherData, fetchWeatherByCoords } from "./api.js";
import { weatherSVGs } from "./icons.js";

document.addEventListener("DOMContentLoaded", () => {
  // ── DOM refs ──────────────────────────────────────────
  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const spinnerRow = document.getElementById("spinner-row");
  const errorMessage = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");
  const inputWrap = document.getElementById("input-wrap");
  const searchScreen = document.getElementById("search-screen");
  const weatherScreen = document.getElementById("weather-screen");
  const backBtn = document.getElementById("back-btn");
  const bgLayer = document.getElementById("bg-layer");
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
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
  let animFrameId = null;
  let particles = [];
  let lightningEl = null;
  let lightningTimer = null;
  let extraEls = [];

  // ── Compass helper ────────────────────────────────────
  function degToCompass(deg) {
    if (deg == null) return "";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  // ── Canvas ────────────────────────────────────────────
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Bug fix: re-seed particles on resize so they fill the new dimensions
    particles.forEach((p) => {
      if (p.x > canvas.width) p.x = Math.random() * canvas.width;
      if (p.y > canvas.height) p.y = Math.random() * canvas.height;
    });
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

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
    // Set CSS class on bg layer
    bgLayer.className = "bg-layer " + type;

    // Clean up all previous extra elements
    extraEls.forEach((el) => el.remove());
    extraEls = [];
    if (lightningEl) {
      lightningEl.remove();
      lightningEl = null;
    }
    if (lightningTimer) {
      clearInterval(lightningTimer);
      lightningTimer = null;
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Light theme for snowy / misty
    const lightThemes = ["snowy", "misty"];
    document.body.classList.toggle("theme-light", lightThemes.includes(type));

    // Inject SVG icon (Bug fix: was never updated previously)
    wxIconWrap.innerHTML = weatherSVGs[type] || weatherSVGs["cloudy"];

    if (type === "clear-day") startClearDay();
    if (type === "clear-night") startClearNight();
    if (type === "cloudy") startClouds();
    if (type === "rainy") startRain(false);
    if (type === "stormy") startRain(true);
    if (type === "snowy") startSnow();
    if (type === "misty") startMist();
  }

  function addExtra(el) {
    document.body.appendChild(el);
    extraEls.push(el);
    return el;
  }

  // ── Clear day ─────────────────────────────────────────
  function startClearDay() {
    const orb = document.createElement("div");
    orb.classList.add("sun-orb");
    addExtra(orb);

    // Animated SVG rays ring
    const rays = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    rays.classList.add("sun-rays");
    rays.setAttribute("viewBox", "0 0 200 200");
    const lines = [0, 45, 90, 135].map((angle) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", "100");
      line.setAttribute("y1", "10");
      line.setAttribute("x2", "100");
      line.setAttribute("y2", "30");
      line.setAttribute("stroke", "rgba(255,220,60,0.4)");
      line.setAttribute("stroke-width", "3");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("transform", `rotate(${angle} 100 100)`);
      return line;
    });
    lines.forEach((l) => rays.appendChild(l));
    addExtra(rays);

    spawnClouds(3, "rgba(255,255,255,0.07)", 80, 180, 30, 60);
  }

  // ── Clear night ───────────────────────────────────────
  function startClearNight() {
    const moon = document.createElement("div");
    moon.classList.add("moon-orb");
    const crescent = document.createElement("div");
    crescent.classList.add("moon-crescent");
    moon.appendChild(crescent);
    addExtra(moon);
    drawStars();
  }

  function drawStars() {
    const count = 200;
    for (let i = 0; i < count; i++) {
      particles.push({
        type: "star",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        r: Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      });
    }
    animateStars();
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((s) => {
      s.opacity += s.twinkleSpeed * s.twinkleDir;
      if (s.opacity >= 0.95) s.twinkleDir = -1;
      if (s.opacity <= 0.1) s.twinkleDir = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,232,255,${s.opacity})`;
      ctx.fill();
    });
    animFrameId = requestAnimationFrame(animateStars);
  }

  // ── Clouds ────────────────────────────────────────────
  function startClouds() {
    spawnClouds(5, "rgba(255,255,255,0.09)", 100, 220, 40, 80);
  }

  function spawnClouds(count, color, minW, maxW, minH, maxH) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.classList.add("cloud-blur");
      const w = minW + Math.random() * (maxW - minW);
      const h = minH + Math.random() * (maxH - minH);
      const top = 5 + Math.random() * 55;
      const dur = 40 + Math.random() * 50;
      const delay = -(Math.random() * dur);
      el.style.cssText = `width:${w}px;height:${h}px;top:${top}%;left:-${w}px;background:${color};animation-duration:${dur}s;animation-delay:${delay}s;`;
      addExtra(el);
    }
  }

  // ── Rain / Storm ──────────────────────────────────────
  function startRain(isStorm) {
    const count = isStorm ? 250 : 150;
    for (let i = 0; i < count; i++) {
      particles.push({
        type: "rain",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: isStorm ? 24 + Math.random() * 14 : 14 + Math.random() * 10,
        speed: isStorm ? 16 + Math.random() * 8 : 8 + Math.random() * 5,
        opacity: 0.25 + Math.random() * 0.45,
        width: isStorm ? 1.5 : 1,
      });
    }
    animateRain(isStorm);

    if (isStorm) {
      lightningEl = document.createElement("div");
      lightningEl.classList.add("lightning-flash");
      document.body.appendChild(lightningEl);
      lightningTimer = setInterval(() => {
        if (Math.random() > 0.55) {
          lightningEl.style.transition = "none";
          lightningEl.style.opacity = "0.8";
          setTimeout(() => {
            lightningEl.style.transition = "opacity 0.3s ease";
            lightningEl.style.opacity = "0";
          }, 70);
        }
      }, 3500);
    }
  }

  function animateRain(isStorm) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.len * 0.18, p.y + p.len);
      ctx.strokeStyle = isStorm
        ? `rgba(160,185,255,${p.opacity})`
        : `rgba(180,218,245,${p.opacity})`;
      ctx.lineWidth = p.width;
      ctx.lineCap = "round";
      ctx.stroke();
      p.y += p.speed;
      p.x += p.speed * 0.18;
      if (p.y > canvas.height || p.x > canvas.width) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    animFrameId = requestAnimationFrame(() => animateRain(isStorm));
  }

  // ── Snow ──────────────────────────────────────────────
  function startSnow() {
    for (let i = 0; i < 130; i++) {
      particles.push({
        type: "snow",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 0.4,
        opacity: 0.55 + Math.random() * 0.45,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
      });
    }
    animateSnow();
  }

  function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.wobble += p.wobbleSpeed;
      p.y += p.speed;
      p.x += p.drift + Math.sin(p.wobble) * 0.4;
      if (p.y > canvas.height) {
        p.y = -5;
        p.x = Math.random() * canvas.width;
      }
      if (p.x > canvas.width) p.x = 0;
      if (p.x < 0) p.x = canvas.width;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${p.opacity})`;
      ctx.fill();
    });
    animFrameId = requestAnimationFrame(animateSnow);
  }

  // ── Mist ──────────────────────────────────────────────
  function startMist() {
    for (let i = 0; i < 5; i++) {
      const el = document.createElement("div");
      el.classList.add("fog-strip");
      const top = 15 + i * 16;
      const dur = 16 + i * 9;
      el.style.cssText = `top:${top}%;animation-duration:${dur}s;animation-delay:-${Math.random() * dur}s;opacity:${0.35 + i * 0.08};`;
      addExtra(el);
    }
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

    try {
      const data = await fetchWeatherData(city);
      localStorage.setItem("lastCity", city);
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
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (lightningTimer) {
      clearInterval(lightningTimer);
      lightningTimer = null;
    }
    if (lightningEl) {
      lightningEl.remove();
      lightningEl = null;
    }
    extraEls.forEach((el) => el.remove());
    extraEls = [];
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgLayer.className = "bg-layer";
    document.body.classList.remove("theme-light"); // Bug fix: was persisting
    weatherScreen.classList.add("hidden");
    searchScreen.classList.remove("hidden");
    cityInput.value = "";
    cityInput.focus();
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
  getWeatherBtn.addEventListener("click", search);
  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search();
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

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          localStorage.setItem("lastCity", data.name);
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

  // Restore + auto-fetch last searched city
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    search();
  } else {
    cityInput.focus();
  }
});
