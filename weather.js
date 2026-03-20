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

  const API_KEY = "dd4d98c0e6234b2913e836a4d840c672";

  let currentData = null;
  let unit = "c";
  let animFrameId = null;
  let particles = [];
  let lightningEl = null;
  let lightningTimer = null;
  let extraEls = [];
  let abortCtrl = null; // Fix: abort stale in-flight fetches

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
  const weatherSVGs = {
    "clear-day": `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFE566"/>
            <stop offset="100%" stop-color="#FFA000"/>
          </radialGradient>
        </defs>
        <!-- Rays -->
        <g stroke="#FFD740" stroke-width="3" stroke-linecap="round" opacity="0.7">
          <line x1="70" y1="10" x2="70" y2="22"/>
          <line x1="70" y1="118" x2="70" y2="130"/>
          <line x1="10" y1="70" x2="22" y2="70"/>
          <line x1="118" y1="70" x2="130" y2="70"/>
          <line x1="25.1" y1="25.1" x2="33.6" y2="33.6"/>
          <line x1="106.4" y1="106.4" x2="114.9" y2="114.9"/>
          <line x1="114.9" y1="25.1" x2="106.4" y2="33.6"/>
          <line x1="33.6" y1="106.4" x2="25.1" y2="114.9"/>
        </g>
        <!-- Sun circle -->
        <circle cx="70" cy="70" r="28" fill="url(#sunGrad)" opacity="0.95"/>
        <circle cx="70" cy="70" r="22" fill="#FFE566" opacity="0.6"/>
        <animateTransform attributeName="transform" type="rotate" from="0 70 70" to="360 70 70" dur="20s" repeatCount="indefinite"/>
      </svg>`,

    "clear-night": `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#E8F0FF"/>
            <stop offset="100%" stop-color="#8BA8E0"/>
          </radialGradient>
        </defs>
        <!-- Stars -->
        <circle cx="30" cy="28" r="2" fill="#C8DAFF" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/></circle>
        <circle cx="110" cy="35" r="1.5" fill="#C8DAFF" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.1s" repeatCount="indefinite"/></circle>
        <circle cx="22" cy="68" r="1.5" fill="#C8DAFF" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.9s" repeatCount="indefinite"/></circle>
        <circle cx="118" cy="60" r="2" fill="#C8DAFF" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="55" cy="18" r="1.2" fill="#C8DAFF" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite"/></circle>
        <!-- Moon body -->
        <circle cx="75" cy="72" r="34" fill="url(#moonGrad)" opacity="0.95"/>
        <!-- Crescent cutout illusion -->
        <circle cx="92" cy="58" r="26" fill="#0a1535" opacity="0.88"/>
        <!-- Soft glow ring -->
        <circle cx="75" cy="72" r="34" stroke="#C8DAFF" stroke-width="1" opacity="0.3" fill="none"/>
      </svg>`,

    cloudy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#d0dce8" stop-opacity="0.85"/>
          </linearGradient>
          <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e8eef5" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#b8c8d8" stop-opacity="0.6"/>
          </linearGradient>
          <filter id="cloudBlur"><feGaussianBlur stdDeviation="1.5"/></filter>
        </defs>
        <!-- Back cloud wrapped in g for valid animateTransform -->
        <g>
          <rect x="30" y="58" width="82" height="36" rx="18" fill="url(#cloudGrad2)" filter="url(#cloudBlur)"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;4,0;0,0" dur="6s" repeatCount="indefinite"/>
        </g>
        <!-- Front cloud group -->
        <g>
          <rect x="16" y="66" width="100" height="40" rx="20" fill="url(#cloudGrad1)"/>
          <circle cx="44" cy="70" r="20" fill="url(#cloudGrad1)"/>
          <circle cx="80" cy="62" r="26" fill="url(#cloudGrad1)"/>
          <circle cx="104" cy="72" r="18" fill="url(#cloudGrad1)"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;-3,0;0,0" dur="5s" repeatCount="indefinite"/>
        </g>
      </svg>`,

    rainy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rainCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78909C"/>
            <stop offset="100%" stop-color="#546E7A"/>
          </linearGradient>
        </defs>
        <!-- Cloud -->
        <rect x="18" y="34" width="100" height="42" rx="21" fill="url(#rainCloud)"/>
        <circle cx="44" cy="42" r="20" fill="url(#rainCloud)"/>
        <circle cx="78" cy="34" r="26" fill="url(#rainCloud)"/>
        <circle cx="104" cy="44" r="17" fill="url(#rainCloud)"/>
        <!-- Rain drops animated -->
        <g stroke="#90CAF9" stroke-width="2.5" stroke-linecap="round" opacity="0.85">
          <line x1="42" y1="90" x2="36" y2="108"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0s" repeatCount="indefinite"/></line>
          <line x1="62" y1="86" x2="56" y2="104"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.2s" repeatCount="indefinite"/></line>
          <line x1="82" y1="90" x2="76" y2="108"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.4s" repeatCount="indefinite"/></line>
          <line x1="102" y1="86" x2="96" y2="104"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.6s" repeatCount="indefinite"/></line>
          <line x1="52" y1="100" x2="46" y2="118"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.9s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.9s" repeatCount="indefinite"/></line>
          <line x1="72" y1="96" x2="66" y2="114"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.1s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.1s" repeatCount="indefinite"/></line>
          <line x1="92" y1="100" x2="86" y2="118"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.7s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.7s" repeatCount="indefinite"/></line>
        </g>
      </svg>`,

    stormy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stormCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#455A64"/>
            <stop offset="100%" stop-color="#263238"/>
          </linearGradient>
          <linearGradient id="boltGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#FFE57F"/>
            <stop offset="100%" stop-color="#FFB300"/>
          </linearGradient>
        </defs>
        <!-- Dark cloud -->
        <rect x="14" y="28" width="108" height="46" rx="23" fill="url(#stormCloud)"/>
        <circle cx="40" cy="38" r="22" fill="url(#stormCloud)"/>
        <circle cx="78" cy="28" r="28" fill="url(#stormCloud)"/>
        <circle cx="108" cy="40" r="19" fill="url(#stormCloud)"/>
        <!-- Lightning bolt -->
        <path d="M78 74 L62 100 L74 100 L58 126 L82 96 L70 96 Z" fill="url(#boltGrad)">
          <animate attributeName="opacity" values="1;0.4;1;0.6;1" dur="2.8s" repeatCount="indefinite"/>
        </path>
        <!-- Rain -->
        <g stroke="#78909C" stroke-width="2" stroke-linecap="round" opacity="0.6">
          <line x1="30" y1="80" x2="24" y2="94"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0s" repeatCount="indefinite"/></line>
          <line x1="110" y1="82" x2="104" y2="96"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.3s" repeatCount="indefinite"/></line>
          <line x1="95" y1="78" x2="89" y2="92"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.15s" repeatCount="indefinite"/></line>
          <line x1="40" y1="84" x2="34" y2="98"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.45s" repeatCount="indefinite"/></line>
        </g>
      </svg>`,

    snowy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="snowCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E3EEF8"/>
            <stop offset="100%" stop-color="#B0C8E0"/>
          </linearGradient>
        </defs>
        <!-- Cloud -->
        <rect x="18" y="30" width="102" height="44" rx="22" fill="url(#snowCloud)"/>
        <circle cx="44" cy="40" r="21" fill="url(#snowCloud)"/>
        <circle cx="78" cy="30" r="28" fill="url(#snowCloud)"/>
        <circle cx="106" cy="42" r="18" fill="url(#snowCloud)"/>
        <!-- Snowflakes -->
        <g fill="#90C4E8" opacity="0.9">
          <circle cx="38" cy="94" r="4"><animate attributeName="cy" values="94;104;94" dur="2s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="0s" repeatCount="indefinite"/></circle>
          <circle cx="58" cy="88" r="3.5"><animate attributeName="cy" values="88;100;88" dur="2.2s" begin="0.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" begin="0.4s" repeatCount="indefinite"/></circle>
          <circle cx="78" cy="92" r="4"><animate attributeName="cy" values="92;104;92" dur="1.8s" begin="0.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" begin="0.8s" repeatCount="indefinite"/></circle>
          <circle cx="98" cy="86" r="3" ><animate attributeName="cy" values="86;98;86" dur="2.4s" begin="0.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.4s" begin="0.2s" repeatCount="indefinite"/></circle>
          <circle cx="48" cy="108" r="3"><animate attributeName="cy" values="108;118;108" dur="2s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="1s" repeatCount="indefinite"/></circle>
          <circle cx="68" cy="104" r="3.5"><animate attributeName="cy" values="104;116;104" dur="2.3s" begin="0.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.3s" begin="0.6s" repeatCount="indefinite"/></circle>
          <circle cx="88" cy="110" r="3"><animate attributeName="cy" values="110;120;110" dur="1.9s" begin="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.9s" begin="1.2s" repeatCount="indefinite"/></circle>
        </g>
      </svg>`,

    misty: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fogGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
            <stop offset="30%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="70%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <!-- Fog lines -->
        <rect x="10" y="44" width="120" height="10" rx="5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" begin="0s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;8,0;0,0" dur="4s" repeatCount="indefinite"/></rect>
        <rect x="10" y="64" width="120" height="8" rx="4" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.8s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-10,0;0,0" dur="5s" repeatCount="indefinite"/></rect>
        <rect x="10" y="82" width="120" height="10" rx="5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.6;0.25;0.6" dur="3.5s" begin="0.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;6,0;0,0" dur="4.5s" repeatCount="indefinite"/></rect>
        <rect x="10" y="100" width="120" height="7" rx="3.5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" begin="1.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-8,0;0,0" dur="6s" repeatCount="indefinite"/></rect>
        <rect x="10" y="118" width="120" height="8" rx="4" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.2s" begin="0.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0" dur="5.5s" repeatCount="indefinite"/></rect>
      </svg>`,
  };

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
    const { main } = currentData;
    tempEl.textContent = fmt(main.temp);
    feelsLikeEl.textContent = fmt(main.feels_like);
    tempMaxEl.textContent = `H: ${fmt(main.temp_max)}`;
    tempMinEl.textContent = `L: ${fmt(main.temp_min)}`;
  }

  // ── Fetch ─────────────────────────────────────────────
  async function fetchWeatherData(city) {
    // Cancel any previous in-flight request
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url, { signal: abortCtrl.signal });
    if (res.status === 404) throw new Error("City not found.");
    if (res.status === 401) throw new Error("Invalid API key.");
    if (!res.ok) throw new Error("Something went wrong.");
    return res.json();
  }

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
    windEl.textContent = `${Math.round(wind.speed)} m/s`;
    visibilityEl.textContent = visibility
      ? `${(visibility / 1000).toFixed(1)} km`
      : "—";

    updateTemps();

    searchScreen.classList.add("hidden");
    weatherScreen.classList.remove("hidden");
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
  cityInput.focus();
});
