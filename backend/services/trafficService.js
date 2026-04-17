const axios = require('axios');

const getTraffic = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${process.env.TOMTOM_API_KEY}`,
      { timeout: 8000 }
    );
    const { currentSpeed, freeFlowSpeed } = data.flowSegmentData;
    return {
      currentSpeed,
      freeFlowSpeed,
      trafficRatio: freeFlowSpeed > 0 ? currentSpeed / freeFlowSpeed : 1,
    };
  } catch (err) {
    console.error('[TrafficService] Failed:', err.message);
    return { currentSpeed: null, freeFlowSpeed: null, trafficRatio: 1 };
  }
};

module.exports = { getTraffic };
