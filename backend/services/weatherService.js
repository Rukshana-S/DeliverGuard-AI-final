const axios = require('axios');

const WMO = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle',
  55: 'Heavy drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Heavy thunderstorm',
};

const getWeather = async (lat, lon) => {
  try {
    // Get current conditions + today's hourly rain to compute current-hour rain and daily total
    const { data } = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code` +
      `&hourly=precipitation,rain,precipitation_probability` +
      `&timezone=auto&forecast_days=1`,
      { timeout: 8000 }
    );

    const c = data.current;

    // Find current hour index
    const now       = new Date();
    const currentHr = now.getHours();
    const hourlyRain = data.hourly?.rain        ?? [];
    const hourlyPrec = data.hourly?.precipitation ?? [];
    const hourlyProb = data.hourly?.precipitation_probability ?? [];

    // Current hour rain (mm in this hour)
    const currentRain = hourlyRain[currentHr] ?? hourlyPrec[currentHr] ?? c.rain ?? c.precipitation ?? 0;

    // Today's total accumulated rain
    const dailyTotal = hourlyRain.reduce((sum, v) => sum + (v || 0), 0);

    // Max rain chance today
    const maxRainChance = Math.max(...hourlyProb, 0);

    // Current hour rain chance
    const currentRainChance = hourlyProb[currentHr] ?? 0;

    return {
      temp:        c.temperature_2m,
      humidity:    c.relative_humidity_2m,
      rain:        parseFloat(currentRain.toFixed(2)),
      dailyRain:   parseFloat(dailyTotal.toFixed(2)),
      rainChance:  currentRainChance,
      maxRainChance,
      description: WMO[c.weather_code] || 'Unknown',
      city:        'Unknown',
      source:      'open-meteo',
    };
  } catch (err) {
    console.error('[WeatherService] Open-Meteo failed:', err.message);
    // Fallback to OWM
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
        { timeout: 8000 }
      );
      return {
        temp:        data.main.temp,
        humidity:    data.main.humidity,
        rain:        data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0,
        dailyRain:   0,
        rainChance:  0,
        maxRainChance: 0,
        description: data.weather?.[0]?.description || '',
        city:        data.name,
        source:      'openweathermap',
      };
    } catch {
      return { temp: null, humidity: null, rain: 0, dailyRain: 0, rainChance: 0, maxRainChance: 0, description: '', city: 'Unknown', source: 'none' };
    }
  }
};

module.exports = { getWeather };
