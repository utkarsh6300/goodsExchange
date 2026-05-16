import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Alert, Platform } from "react-native";
import * as Location from "expo-location";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_CACHE_KEY = "@user_location";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: string | null;
  errorMsg: string | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
  manualSetLocation: (addressStr: string) => Promise<boolean>;
  manualSetCoords: (lat: number, lon: number) => Promise<void>;
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
        const finalAddress = addressStr.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        setAddress(finalAddress);
        return finalAddress;
      } else {
        const fallback = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        setAddress(fallback);
        return fallback;
      }
    } catch (e) {
      const fallback = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      setAddress(fallback);
      return fallback;
    }
  };

  const manualSetCoords = async (lat: number, lon: number) => {
    setIsLoading(true);
    const locObject = {
      coords: {
        latitude: lat,
        longitude: lon,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as Location.LocationObject;

    setLocation(locObject);
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locObject));
    await resolveAddress(lat, lon);
    setIsLoading(false);
  };

  const manualSetLocation = async (addressStr: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const results = await Location.geocodeAsync(addressStr);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const locObject = {
          coords: {
            latitude,
            longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as Location.LocationObject;

        setLocation(locObject);
        setAddress(addressStr);
        await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locObject));
        setErrorMsg(null);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (e) {
      console.error("manualSetLocation error:", e);
      setIsLoading(false);
      return false;
    }
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    console.log("[LocationContext] Refreshing location...");
    
    try {
      const isRealDevice = Device.isDevice;
      console.log(`[LocationContext] Device: ${Platform.OS}, isRealDevice: ${isRealDevice}`);

      if (Platform.OS === 'android' && !isRealDevice) {
        console.log("[LocationContext] Running on Android Emulator - Location might be simulated.");
      }

      // 1. Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(`[LocationContext] Permission status: ${status}`);
      if (status !== "granted") {
        setErrorMsg("Permission denied. Please allow location access in settings.");
        setIsLoading(false);
        return;
      }

      // 2. Check if enabled
      let enabled = await Location.hasServicesEnabledAsync();
      console.log(`[LocationContext] Services enabled: ${enabled}`);
      if (!enabled && Platform.OS === 'android') {
        try {
          console.log("[LocationContext] Attempting to enable network provider...");
          await Location.enableNetworkProviderAsync();
          enabled = await Location.hasServicesEnabledAsync();
          console.log(`[LocationContext] Services enabled after request: ${enabled}`);
        } catch (e) {
          console.log("[LocationContext] Network provider request failed or was cancelled");
        }
      }

      if (!enabled) {
        setErrorMsg("Location services are disabled. Please enable GPS.");
        setIsLoading(false);
        return;
      }

      // 3. Get position
      let loc = null;
      
      // On Emulators, getLastKnownPosition is often much faster and more reliable
      if (!isRealDevice) {
        console.log("[LocationContext] Emulator detected, trying last known position first...");
        loc = await Location.getLastKnownPositionAsync({});
        if (loc) console.log("[LocationContext] Successfully got last known position from emulator.");
      }

      if (!loc) {
        console.log("[LocationContext] Fetching fresh position (timeout: 10s)...");
        try {
          loc = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error("Timeout getting location")), 10000)
            )
          ]);
          if (loc) console.log("[LocationContext] Successfully fetched fresh position.");
        } catch (err) {
          console.warn("[LocationContext] Location request timed out, trying last known position as fallback.");
          loc = await Location.getLastKnownPositionAsync({});
          if (loc) console.log("[LocationContext] Successfully got last known position fallback.");
        }
      }
      
      if (loc && loc.coords) {
        console.log(`[LocationContext] Position found: ${loc.coords.latitude}, ${loc.coords.longitude}`);
        const locObject = { 
          coords: loc.coords, 
          timestamp: loc.timestamp 
        } as Location.LocationObject;
        
        setLocation(locObject);
        await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locObject));
        const resolvedAddr = await resolveAddress(loc.coords.latitude, loc.coords.longitude);
        console.log(`[LocationContext] Resolved address: ${resolvedAddr}`);
        setErrorMsg(null);
      } else {
        console.warn("[LocationContext] No location found after all attempts.");
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          console.log("[LocationContext] Using cached location as final fallback.");
          const parsed = JSON.parse(cached);
          setLocation(parsed);
          await resolveAddress(parsed.coords.latitude, parsed.coords.longitude);
        } else if (!isRealDevice) {
          // Provide a default for emulators so they don't get stuck
          console.log("[LocationContext] Providing default location for emulator (San Francisco).");
          const defaultLoc = {
            coords: { latitude: 37.7749, longitude: -122.4194 },
            timestamp: Date.now()
          } as any;
          setLocation(defaultLoc);
          await resolveAddress(37.7749, -122.4194);
        } else {
          setErrorMsg("Could not retrieve location. Please ensure location services are enabled.");
        }
      }
    } catch (error: any) {
      console.error("[LocationContext] refreshLocation error:", error);
      setErrorMsg("Error retrieving location.");
    } finally {
      setIsLoading(false);
      console.log("[LocationContext] Refresh cycle complete.");
    }
  };

  useEffect(() => {
    const init = async () => {
      console.log("[LocationContext] Initializing Location Context...");
      try {
        // 1. Try to load cache for immediate display
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          console.log("[LocationContext] Found cached location. Loading for fast UI.");
          const parsed = JSON.parse(cached);
          setLocation(parsed);
          // Resolve address in background
          resolveAddress(parsed.coords.latitude, parsed.coords.longitude);
        }
        
        // 2. Always trigger a fresh refresh to get accurate "last" position
        // This makes startup behave like the manual refresh button
        await refreshLocation();
        
      } catch (e) {
        console.error("[LocationContext] Initialization error:", e);
        await refreshLocation();
      }
    };
    init();
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, errorMsg, isLoading, refreshLocation, manualSetLocation, manualSetCoords }}>
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
