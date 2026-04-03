export default async function handler(req, res) {
  const { city, lat, lon } = req.query;
  const API_KEY = (process.env.WEATHER_API_KEY || "").trim();

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    let url = "";
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city,
      )}&units=metric&appid=${API_KEY}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data.message || "Something went wrong" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
}
