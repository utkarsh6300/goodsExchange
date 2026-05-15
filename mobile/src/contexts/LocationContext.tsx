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
    try {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Location will not work reliably on Android Emulators. Try it on a real device!'
        );
        // We continue anyway as some emulators might support it or we can fallback to cache
      }

      // 1. Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied. Please allow location access in settings.");
        setIsLoading(false);
        return;
      }

      // 2. Check if enabled
      let enabled = await Location.hasServicesEnabledAsync();
      if (!enabled && Platform.OS === 'android') {
        try {
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

      // 3. Get position - Try fresh position with a timeout
      let loc = null;
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
        console.warn("Location request timed out, trying last known position.");
        loc = await Location.getLastKnownPositionAsync({});
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
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (!cached) {
          setErrorMsg("Could not retrieve location.");
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
