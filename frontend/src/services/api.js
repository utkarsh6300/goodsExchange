import axios from "axios";
import { api_url } from "../constants/url";

let logoutHandler = null;
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const api = axios.create({
  baseURL: api_url,
});

// Attach token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["token"] = token;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Global response handler: if any response is 401, call the logout handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      if (typeof logoutHandler === "function") {
        try {
          logoutHandler();
        } catch (e) {
          // swallow errors from handler
          console.error("Error in logout handler", e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
