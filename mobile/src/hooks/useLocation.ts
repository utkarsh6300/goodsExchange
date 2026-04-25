import { useState, useEffect } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      setErrorMsg(null);
      
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setErrorMsg("Location services are disabled. Please enable them.");
        return;
      }

      let { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Try to get last known position first (fast, works better on some emulators)
      let loc = await Location.getLastKnownPositionAsync({});
      
      if (!loc) {
        // If no last known, try current position
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      
      setLocation(loc);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { street, city, region, postalCode } = reverseGeocode[0];
        setAddress(`${street || ""}, ${city}, ${region} ${postalCode || ""}`);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to get location");
    }
  };

  return { location, address, errorMsg, getLocation };
};
