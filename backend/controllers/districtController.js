const {
  getAllDistrictsData,
  getDistrictData,
  getAlertsOnly,
  getDistrictsByState,
  getDistrictSummary,
  INDIAN_DISTRICTS,
} = require('../services/districtService');

// GET /api/districts - Get all districts list
const getDistrictsList = async (req, res) => {
  try {
    res.json({ districts: INDIAN_DISTRICTS, total: INDIAN_DISTRICTS.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/districts/all - Get weather data for all districts
const getAllDistricts = async (req, res) => {
  try {
    const data = await getAllDistrictsData();
    res.json({ districts: data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/districts/:name - Get data for specific district
const getDistrict = async (req, res) => {
  try {
    const data = await getDistrictData(req.params.name);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// GET /api/districts/alerts/active - Get only districts with alerts
const getAlerts = async (req, res) => {
  try {
    const data = await getAlertsOnly();
    res.json({ alerts: data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/districts/grouped/state - Get districts grouped by state
const getGroupedByState = async (req, res) => {
  try {
    const data = await getDistrictsByState();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/districts/summary - Get summary statistics
const getSummary = async (req, res) => {
  try {
    const data = await getDistrictSummary();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDistrictsList,
  getAllDistricts,
  getDistrict,
  getAlerts,
  getGroupedByState,
  getSummary,
};
