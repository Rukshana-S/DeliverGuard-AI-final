const axios = require('axios');

const getWeather = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
      { timeout: 8000 }
    );
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      rain: data.rain?.['1h'] || 0,
      city: data.name,
    };
  } catch (err) {
    console.error('[WeatherService] Failed:', err.message);
    return { temp: null, humidity: null, rain: 0, city: 'Unknown' };
  }
};

module.exports = { getWeather };
