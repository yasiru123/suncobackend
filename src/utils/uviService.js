const axios = require('axios');

/**
 * Fetch UVI (UV Index) from OpenUV API or similar service
 * Formula: E (W/m²) = UVI * 0.025
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<number>} - UVI value
 */
const fetchUVI = async (lat, lon) => {
  try {
    const apiKey = process.env.UVI_API_KEY;
    const apiUrl = process.env.UVI_API_URL || 'https://api.openuv.io/api/v1/uv';

    if (!apiKey) {
      console.warn('UVI_API_KEY not configured. Using mock UVI value.');
      // Return a mock UVI value for testing (random between 0-11)
      return Math.random() * 11;
    }

    const response = await axios.get(apiUrl, {
      params: { lat, lng: lon },
      headers: { 'x-access-token': apiKey },
      timeout: 5000
    });

    const uvi = response.data?.result?.uv || 0;
    return uvi;
  } catch (error) {
    console.error('Error fetching UVI:', error.message);
    // Return fallback UVI value
    return 3; // Moderate default
  }
};

/**
 * Calculate dose increment based on UVI and time interval
 * Formula: ΔDose (J/m²) = UVI * 0.025 * Δt (seconds)
 * @param {number} uvi - UV Index
 * @param {number} intervalSeconds - Time interval in seconds
 * @returns {number} - Dose increment in J/m²
 */
const calculateDoseIncrement = (uvi, intervalSeconds) => {
  const E = uvi * 0.025; // Erythemal irradiance in W/m²
  const doseIncrement = E * intervalSeconds; // J/m²
  return doseIncrement;
};

/**
 * Determine if cumulative dose has reached MED threshold
 * @param {number} cumulativeDose - Current cumulative dose in J/m²
 * @param {number} medThreshold - MED threshold for user's skin type in J/m²
 * @returns {boolean} - True if threshold reached
 */
const hasReachedMED = (cumulativeDose, medThreshold) => {
  return cumulativeDose >= medThreshold;
};

/**
 * Get MED value for a given skin type
 * @param {number} skinType - Skin type (1-6)
 * @returns {number} - MED value in J/m²
 */
const getMEDForSkinType = (skinType) => {
  const medMap = {
    1: 225,   // Very fair skin
    2: 275,   // Fair skin
    3: 350,   // Medium skin
    4: 500,   // Olive skin
    5: 700,   // Brown skin
    6: 1000   // Dark skin
  };
  return medMap[skinType] || 350; // Default to Type 3
};

module.exports = {
  fetchUVI,
  calculateDoseIncrement,
  hasReachedMED,
  getMEDForSkinType
};


