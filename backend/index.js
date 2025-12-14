// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8080; // You can change this to your desired port

// Middleware to parse JSON requests
app.use(express.json());

// database
const connectDB = require("./config/db");

//connect database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Goods-Exchange Express API!");
});

app.use("/api/signup", require("./routes/api/signup"));
app.use("/api/login", require("./routes/api/login"));
app.use("/api/verify_token", require("./middlewares/verify_token"));
app.use("/api/verify", require("./routes/api/verify"));
app.use("/api/product", require("./routes/api/product"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/chat", require("./routes/api/chat"));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Authenticate socket connection using token passed in handshake auth
  try {
    const token =
      socket.handshake && socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      console.warn("Socket connection without token from", socket.id);
      socket.emit("unauthorized", "No token provided");
      socket.disconnect();
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.jwtSecret);
    } catch (err) {
      console.warn(
        "Socket token verification failed for",
        socket.id,
        err.message
      );
      socket.emit("unauthorized", "Invalid token");
      socket.disconnect();
      return;
    }

    // Attach authenticated user info to socket for later use
    socket.user = decoded && decoded.user ? decoded.user : null;
    // console.log("Socket authenticated user:", socket.user && socket.user.id);
  } catch (err) {
    console.error("Unexpected error during socket authentication:", err);
  }

  // Join a conversation room
  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  // Handle incoming messages
  socket.on("sendMessage", async (data) => {
    try {
      // console.log(
      //   "Socket sendMessage received raw data from",
      //   socket.id,
      //   ":",
      //   data
      // );
      const {
        conversationId,
        sender: payloadSender,
        receiver,
        text,
        timestamp,
      } = data || {};

      // Prefer sender from payload, otherwise use authenticated socket user id
      const sender = payloadSender || (socket.user && socket.user.id) || null;

      if (!conversationId || !sender || !receiver || !text) {
        console.warn("sendMessage missing fields:", {
          conversationId,
          sender,
          receiver,
          text,
        });
        socket.emit("messageError", "Missing required fields");
        return;
      }

      // Save message to database
      const Message = require("./models/Message");
      const newMessage = new Message({
        conversationId,
        sender,
        receiver,
        text,
        timestamp: timestamp || new Date(),
      });
      await newMessage.save();
      console.log("Message saved:", newMessage._id);

      // Populate sender and receiver for the emitted message
      await newMessage.populate("sender", "username name");
      await newMessage.populate("receiver", "username name");
      // console.log("Message populated sender/receiver:", {
      //   sender: newMessage.sender,
      //   receiver: newMessage.receiver,
      // });

      // Update conversation's last message and timestamp
      const Conversation = require("./models/Conversation");
      try {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageTimestamp: new Date(),
        }).exec();
      } catch (convErr) {
        console.error("Error updating conversation last message:", convErr);
      }

      // Emit populated message to all users in the room
      io.to(conversationId).emit("newMessage", newMessage);
      console.log("Emitted newMessage to room", conversationId);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", "Failed to send message");
    }
  });

  // Leave room
  socket.on("leaveRoom", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left room ${conversationId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
