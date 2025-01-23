import axios from "axios";
import { api_url } from "./constants/url";

const verifyToken = async (token) => {
  try {
    const config = {
      headers: {
        token: token,
      },
    };
    const response = await axios.get(`${api_url}/verify_token`, config);
    return response.status === 200; // Return true if token is valid
  } catch (error) {
    console.error(
      "Token verification failed:",
      error.response?.status,
      error.message
    );
    return false; // Return false for any error (e.g., 401, 500)
  }
};

export default verifyToken;
