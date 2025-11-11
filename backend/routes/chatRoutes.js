const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} = require("../controllers/chatController");

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Get or create conversation between users for a specific asset
router.get("/conversation/:assetId/:otherUserId", getOrCreateConversation);

// Get all conversations for current user
router.get("/conversations", getConversations);

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Send a new message
router.post("/conversations/:conversationId/messages", sendMessage);

// Mark messages as read
router.put("/conversations/:conversationId/read", markAsRead);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Delete a message
router.delete("/messages/:messageId", deleteMessage);

module.exports = router;
