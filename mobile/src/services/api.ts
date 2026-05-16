import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter, Platform } from "react-native";
import Constants from "expo-constants";

// @ts-ignore
import { ANDROID_EMULATOR_BASE_URL } from "@env";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return ANDROID_EMULATOR_BASE_URL || BASE_URL;
    }
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
