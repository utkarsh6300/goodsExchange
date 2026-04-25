import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_CACHE_KEY = "@user_location";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: string | null;
  errorMsg: string | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveAddress = async (lat: number, lon: number) => {
    try {
      let response = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      
      if (response.length > 0) {
        const item = response[0];
        let addressStr = `${item.name || ""} ${item.city || ""} ${item.region || ""}`;
        setAddress(addressStr.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      } else {
        setAddress(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      }
    } catch (e) {
      setAddress(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
    }
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied. Please allow location access in settings.");
        setIsLoading(false);
        return;
      }

      // 2. Check if enabled
      let enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        try {
          // This only works on Android, will throw on iOS but that's okay
          await Location.enableNetworkProviderAsync();
          enabled = await Location.hasServicesEnabledAsync();
        } catch (e) {
          console.log("Network provider not enabled");
        }
      }

      if (!enabled) {
        setErrorMsg("Location services are disabled. Please enable GPS.");
        setIsLoading(false);
        return;
      }

      // 3. Get position - Try last known first (much more reliable on emulators)
      let loc = await Location.getLastKnownPositionAsync({});
      
      if (!loc) {
        // Fallback to fresh position with a timeout
        try {
          loc = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error("Timeout getting location")), 10000)
            )
          ]);
        } catch (err) {
          console.warn("Location request timed out, using fallback.");
        }
      }
      
      if (loc && loc.coords) {
        const locObject = { 
          coords: loc.coords, 
          timestamp: loc.timestamp 
        } as Location.LocationObject;
        
        setLocation(locObject);
        await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locObject));
        await resolveAddress(loc.coords.latitude, loc.coords.longitude);
        setErrorMsg(null);
      } else {
        // If we still have no location and no cache, set an error
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (!cached) {
          setErrorMsg("Could not retrieve location. Try setting a location in your emulator settings.");
        }
      }
    } catch (error: any) {
      console.error("refreshLocation error:", error);
      setErrorMsg("Error retrieving location.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setLocation(parsed);
          await resolveAddress(parsed.coords.latitude, parsed.coords.longitude);
          setIsLoading(false);
        } else {
          await refreshLocation();
        }
      } catch (e) {
        await refreshLocation();
      }
    };
    init();
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, errorMsg, isLoading, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
