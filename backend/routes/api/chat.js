const express = require("express");
const router = express.Router();
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const User = require("../../models/User");
const auth = require("../../middlewares/authMiddleware");
const { validationResult } = require("express-validator");

// Get all conversations for the current user
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username name")
      .populate("product", "name imagesUrls price")
      .sort({ lastMessageTimestamp: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a specific conversation
router.get(
  "/conversations/:conversationId/messages",
  auth,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      // Verify user is a participant in the conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(userId)) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this conversation" });
      }

      const messages = await Message.find({ conversationId })
        .populate("sender", "username name")
        .populate("receiver", "username name")
        .sort({ timestamp: 1 });

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

// Create or get existing conversation between two users
router.post("/conversations", auth, async (req, res) => {
  try {
    const { otherUserId, productId } = req.body;
    const userId = req.user.id;

    // Validate the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, otherUserId],
      },
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, otherUserId],
        product: productId || null,
      });
      await conversation.save();
    }

    // Populate and return
    await conversation.populate("participants", "username name");
    await conversation.populate("product", "name imagesUrls price");

    res.json(conversation);
  } catch (error) {
    console.error("Error creating/getting conversation:", error);
    res.status(500).json({ error: "Failed to create/get conversation" });
  }
});

// Send a message (legacy endpoint, primary method is via Socket.IO)
router.post("/messages", auth, async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;
    const senderId = req.user.id;

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to send message in this conversation" });
    }

    const message = new Message({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      text,
    });
    await message.save();

    // Update conversation's last message
    conversation.lastMessage = text;
    conversation.lastMessageTimestamp = new Date();
    await conversation.save();

    await message.populate("sender", "username name");
    await message.populate("receiver", "username name");

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.put("/messages/:messageId/read", auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

module.exports = router;
