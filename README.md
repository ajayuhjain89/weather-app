# 🌤️ Minimal Weather

A beautiful, minimal weather PWA I built with vanilla JavaScript — no frameworks, no build step. Just clean HTML, CSS, and JS with some really satisfying animations.

🔗 [Live Demo](https://weather-app-xi-cyan-20.vercel.app/)

---

## ✨ Features

- **Live Weather Data** — Powered by the [OpenWeatherMap API](https://openweathermap.org/api)
- **Animated Backgrounds** — Canvas and CSS animations for every weather condition (clear day/night, rain, storm, snow, mist, clouds)
- **Geolocation Support** — One-tap weather for your current location
- **Recent Searches** — Remembers your last 3 searched cities
- **°C / °F Toggle** — Switch temperature units instantly
- **PWA / Installable** — Works offline via Service Worker; add to home screen on iOS & Android
- **Battery Saver** — Animations pause automatically when the tab is hidden
- **Session Caching** — API responses cached for 10 minutes so you're not hammering the API
- **Light & Dark Themes** — Auto-switches for snowy/misty conditions

---

## 🗂️ Project Structure

```
.
├── index.html       # App shell & markup
├── style.css        # All styles (glassmorphism, animations, themes)
├── weather.js       # Main app logic & UI controller
├── api.js           # Fetch helpers with caching & abort control
├── animations.js    # Canvas + DOM weather animations
├── icons.js         # Animated inline SVG weather icons
├── sw.js            # Service Worker (PWA, offline support)
├── manifest.json    # Web App Manifest
└── favicon.png      # App icon
```

---

## 🚀 Getting Started

### Prerequisites

- A free [OpenWeatherMap API key](https://home.openweathermap.org/users/sign_up)
- A server that supports environment variables — I used [Vercel](https://vercel.com) and it works great

### 1. Clone the repo

```bash
git clone https://github.com/ajayuhjain89/weather-app.git
cd weather-app
```

### 2. Set your API key

The backend handler reads from an environment variable, so your key never ends up in the client code:

```env
WEATHER_API_KEY=your_api_key_here
```

Set this in your Vercel project settings (or `.env` locally if using Express).

### 3. Deploy

**Vercel (what I use)**

```bash
npm i -g vercel
vercel
```

The `weather.js` file in `/api` is a Vercel serverless function that proxies requests to OpenWeatherMap. Any platform supporting serverless functions will work fine too.

---

## 🌦️ Weather Animations

| Condition    | Background        | Canvas Effect              |
|--------------|-------------------|----------------------------|
| Clear Day    | Blue-to-gold sky  | Sun orb + rotating rays    |
| Clear Night  | Deep navy         | Twinkling stars            |
| Cloudy       | Steel grey        | Drifting clouds            |
| Rainy        | Dark slate        | Falling rain               |
| Stormy       | Near-black        | Heavy rain + lightning     |
| Snowy        | Pale ice blue     | Falling snowflakes         |
| Misty        | Muted grey-blue   | Scrolling fog strips       |

---

## 📱 PWA Installation

Open the app in your mobile browser and tap **"Add to Home Screen"** — it installs like a native app. The Service Worker pre-caches all assets so it loads instantly, even without internet.

---

## 🔧 Config Reference

| Variable              | Location       | Description                          |
|-----------------------|----------------|--------------------------------------|
| `WEATHER_API_KEY`     | Server env var | Your OpenWeatherMap API key          |
| `CACHE_DURATION`      | `api.js`       | Session cache TTL (default: 10 min)  |
| `CACHE_NAME`          | `sw.js`        | Service Worker cache version string  |

---

## 🛠️ Tech Stack

- **Vanilla JS** (ES Modules) — no framework, no build step
- **Canvas API** — particle-based rain, snow & star animations
- **CSS Custom Properties + Backdrop Filter** — glassmorphism UI
- **OpenWeatherMap API** — weather data
- **Service Worker** — offline PWA support
- **Playfair Display + DM Mono** — Google Fonts