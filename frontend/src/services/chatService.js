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

// Global response handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      if (logoutHandler) {
        logoutHandler();
      }
    }
    return Promise.reject(error);
  }
);

class ChatService {
  // Get all conversations for the current user
  async getConversations() {
    return api.get("/chat/conversations");
  }

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    return api.get(`/chat/conversations/${conversationId}/messages`);
  }

  // Create or get an existing conversation
  async createOrGetConversation(otherUserId, productId = null) {
    return api.post("/chat/conversations", {
      otherUserId,
      productId,
    });
  }

  // Send a message (legacy endpoint, primary method is via Socket.IO)
  async sendMessage(conversationId, receiverId, text) {
    return api.post("/chat/messages", {
      conversationId,
      receiverId,
      text,
    });
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    return api.put(`/chat/messages/${messageId}/read`);
  }
}

export default new ChatService();
