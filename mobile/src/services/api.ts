import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter, Platform } from "react-native";
// @ts-ignore
import { BASE_URL, ANDROID_EMULATOR_BASE_URL, DEV_BASE_URL } from "@env";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      // Check if we are on emulator or physical device might be hard at runtime here, 
      // but usually 10.0.2.2 works for emulators.
      // If using physical device, DEV_BASE_URL (your local IP) is better.
      return ANDROID_EMULATOR_BASE_URL || DEV_BASE_URL || BASE_URL;
    }
    return DEV_BASE_URL || BASE_URL;
  }
  return BASE_URL;
};

const finalBaseUrl = getBaseUrl();
console.log("API Base URL used:", finalBaseUrl);

const api = axios.create({
  baseURL: finalBaseUrl,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SecureStore.deleteItemAsync("userToken");
      DeviceEventEmitter.emit("forceLogout");
    }
    return Promise.reject(error);
  }
);

export default api;
