const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  ],
  lastMessage: {
    type: String,
    default: "",
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique conversation between two participants
ConversationSchema.index({ participants: 1 }, { unique: false });

module.exports = mongoose.model("Conversation", ConversationSchema);
