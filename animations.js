let canvas = null;
let ctx = null;
let animFrameId = null;
let particles = [];
let extraEls = [];
let lightningEl = null;
let lightningTimer = null;
let isPaused = false;
let currentAnimationType = null;

export function initAnimations(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ── Battery Saver (Pause on tab hide) ─────────────────
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      isPaused = true;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else {
      isPaused = false;
      resumeAnimation();
    }
  });
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Re-seed particles on resize so they fill the new dimensions
  particles.forEach((p) => {
    if (p.x > canvas.width) p.x = Math.random() * canvas.width;
    if (p.y > canvas.height) p.y = Math.random() * canvas.height;
  });
}

export function clearAnimations() {
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
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function playAnimation(type) {
  currentAnimationType = type;
  if (type === "clear-day") startClearDay();
  if (type === "clear-night") startClearNight();
  if (type === "cloudy") startClouds();
  if (type === "rainy") startRain(false);
  if (type === "stormy") startRain(true);
  if (type === "snowy") startSnow();
  if (type === "misty") startMist();
}

function resumeAnimation() {
  if (currentAnimationType === "rainy") animateRain(false);
  else if (currentAnimationType === "stormy") animateRain(true);
  else if (currentAnimationType === "snowy") animateSnow();
  else if (currentAnimationType === "clear-night") animateStars();
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
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
  if (isPaused) return;
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
      if (Math.random() > 0.55 && !isPaused) {
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
  if (isPaused) return;
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
  if (isPaused) return;
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
