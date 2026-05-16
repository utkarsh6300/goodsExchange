import { io, Socket } from "socket.io-client";

// Note: When testing on a physical device or Android emulator, localhost won't work.
// Replace this with your computer's local IP address (e.g., http://192.168.1.100:5000)
const SOCKET_URL = "http://localhost:5000";

class SocketService {
  public socket: Socket | null;

  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      this.socket.on("connect", () => {
        console.log("Connected to socket server");
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
