const axios = require('axios');

const getAQI = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.WAQI_TOKEN}`,
      { timeout: 8000 }
    );
    if (data.status !== 'ok') throw new Error('WAQI returned non-ok status');
    return { aqi: data.data.aqi };
  } catch (err) {
    console.error('[AQIService] Failed:', err.message);
    return { aqi: null };
  }
};

module.exports = { getAQI };
