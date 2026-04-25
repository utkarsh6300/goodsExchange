import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Replace with your local machine's IP for device testing
// const BASE_URL = "http://localhost:5000/api";
const BASE_URL = "https://goodsexchange.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
