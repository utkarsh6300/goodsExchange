import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
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
// Socket.IO treats paths in the URL as namespaces. 
// If our BASE_URL is http://.../api, we need to strip /api to connect to the root namespace.
const SOCKET_URL = finalBaseUrl ? finalBaseUrl.replace(/\/api\/?$/, "") : "";

class SocketService {
  public socket: Socket | null;

  constructor() {
    this.socket = null;
  }

  async connect() {
    if (this.socket?.connected) return;

    const token = await SecureStore.getItemAsync("userToken");
    
    console.log("Connecting to socket at:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error details:", {
        message: err.message,
        url: SOCKET_URL,
        // @ts-ignore
        description: err.description,
        // @ts-ignore
        context: err.context
      });
    });

    this.socket.on("unauthorized", (msg) => {
      console.error("Socket unauthorized:", msg);
    });

    this.socket.on("messageError", (msg) => {
      console.error("Socket message error:", msg);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(conversationId: string) {
    if (this.socket) {
      this.socket.emit("joinRoom", conversationId);
    }
  }

  leaveRoom(conversationId: string) {
    if (this.socket) {
      this.socket.emit("leaveRoom", conversationId);
    }
  }
}

const socketService = new SocketService();
export default socketService;
