require('dotenv').config();

module.exports = ({ config }) => {
  const YOUR_GOOGLE_MAPS_API_KEY = process.env.YOUR_GOOGLE_MAPS_API_KEY || "";
  const BASE_URL = process.env.BASE_URL || "";

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: YOUR_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      ...config.extra,
      YOUR_GOOGLE_MAPS_API_KEY,
      BASE_URL,
      eas: {
        projectId: "260a7e0a-3879-4383-b837-ece2bed8dbcc",
      },
    },
  };
};
