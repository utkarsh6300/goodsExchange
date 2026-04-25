import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter } from "react-native";
// @ts-ignore
import { BASE_URL } from "@env";

console.log("API Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL || "https://goodsexchange.onrender.com/api",
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
