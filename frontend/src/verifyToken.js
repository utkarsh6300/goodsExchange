import api from "./services/api";

const verifyToken = async (token) => {
  try {
    // request interceptor already attaches token from localStorage,
    // but pass token explicitly here to be explicit when needed
    const response = await api.get("/verify_token", { headers: { token } });
    return response.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default verifyToken;
