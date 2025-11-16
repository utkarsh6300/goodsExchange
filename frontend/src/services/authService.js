import api from "./api";

export const login = (phone, password) => {
  return api.post("/login", {
    phone,
    password,
  });
};

export const signup = (username, name, phone, email, password) => {
  return api.post("/signup", {
    username,
    name,
    phone,
    email,
    password,
  });
};

export default {
  login,
  signup,
};
