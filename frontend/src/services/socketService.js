import io from "socket.io-client";
import { api_url } from "../constants/url";

// socket should connect to server root (not the /api path)
const socketUrl = api_url.replace(/\/api\/?$/, "");

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket) {
      return this.socket;
    }

    // console.log(
    //   "SocketService.connect() -> connecting to",
    //   socketUrl,
    //   "token present?",
    //   !!token
    // );
    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(conversationId) {
    if (this.socket) {
      console.log("SocketService.joinRoom()", conversationId);
      this.socket.emit("joinRoom", conversationId);
    }
  }

  leaveRoom(conversationId) {
    if (this.socket) {
      console.log("SocketService.leaveRoom()", conversationId);
      this.socket.emit("leaveRoom", conversationId);
    }
  }

  sendMessage(conversationId, sender, receiver, text) {
    if (this.socket) {
      const payload = {
        conversationId,
        sender,
        receiver,
        text,
        timestamp: new Date(),
      };
      console.log("SocketService.sendMessage() emitting", payload);
      this.socket.emit("sendMessage", payload);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("newMessage", (msg) => {
        // console.log("SocketService received newMessage", msg);
        callback(msg);
      });
    }
  }

  offNewMessage(callback) {
    if (this.socket) {
      console.log("SocketService.offNewMessage()");
      this.socket.off("newMessage", callback);
    }
  }

  onMessageError(callback) {
    if (this.socket) {
      this.socket.on("messageError", callback);
    }
  }

  offMessageError(callback) {
    if (this.socket) {
      this.socket.off("messageError", callback);
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
