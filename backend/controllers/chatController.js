const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Asset = require("../models/Asset");
const Booking = require("../models/Bookings");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// Get or create conversation between users for a specific asset
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { assetId, otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(assetId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid asset or user ID" });
    }

    // Verify asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Verify other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      asset: assetId,
      participants: {
        $all: [
          { user: currentUserId },
          { user: otherUserId }
        ]
      }
    }).populate("participants.user", "firstName lastName email role");

    if (!conversation) {
      // Create new conversation
      const currentUserRole = req.user.role;
      const otherUserRole = otherUser.role;

      conversation = new Conversation({
        participants: [
          { user: currentUserId, role: currentUserRole },
          { user: otherUserId, role: otherUserRole }
        ],
        asset: assetId,
        lastMessageAt: new Date()
      });

      await conversation.save();
      await conversation.populate("participants.user", "firstName lastName email role");
    }

    // Populate asset details
    await conversation.populate("asset", "name address price images category");

    res.status(200).json({
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        asset: conversation.asset,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        isActive: conversation.isActive,
        createdAt: conversation.createdAt
      }
    });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: { $elemMatch: { user: userId } },
      isActive: true
    })
      .populate("participants.user", "firstName lastName email role")
      .populate("asset", "name address price images category")
      .populate("lastMessage", "content sender createdAt messageType")
      .populate("lastMessage.sender", "firstName lastName")
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments({
      participants: { $elemMatch: { user: userId } },
      isActive: true
    });

    // Calculate unread counts for each conversation
    const conversationIds = conversations.map(conv => conv._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds.map(id => new ObjectId(id)) },
          sender: { $ne: new ObjectId(userId) },
          isRead: false
        }
      },
      {
        $group: {
          _id: "$conversation",
          count: { $sum: 1 }
        }
      }
    ]);

    // Map conversationId -> unreadCount
    const unreadCountMap = {};
    unreadCounts.forEach(item => {
      unreadCountMap[item._id.toString()] = item.count;
    });

    const response = conversations
      .map(conv => {
        // SAFETY CHECK: handle missing / deleted users
        const otherParticipant = conv.participants.find(
          p => p?.user && p.user._id.toString() !== userId
        );

        if (!otherParticipant) return null;

        const unreadCount = unreadCountMap[conv._id.toString()] || 0;

        return {
          _id: conv._id,
          otherUser: {
            _id: otherParticipant.user._id,
            name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
            role: otherParticipant.user.role,
            email: otherParticipant.user.email
          },
          asset: conv.asset
            ? {
                _id: conv.asset._id,
                name: conv.asset.name,
                address: conv.asset.address,
                price: conv.asset.price,
                images: conv.asset.images,
                category: conv.asset.category
              }
            : null,
          lastMessage: conv.lastMessage
            ? {
                _id: conv.lastMessage._id,
                content: conv.lastMessage.content,
                sender: conv.lastMessage.sender
                  ? `${conv.lastMessage.sender.firstName} ${conv.lastMessage.sender.lastName}`
                  : "Unknown",
                timestamp: conv.lastMessage.createdAt,
                messageType: conv.lastMessage.messageType
              }
            : null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt
        };
      })
      .filter(Boolean); // remove null (broken) conversations

    res.status(200).json({
      conversations: response,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $elemMatch: { user: userId } }
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "firstName lastName role")
      .populate("replyTo", "content sender")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ conversation: conversationId });

    const response = messages.reverse().map(msg => ({
      _id: msg._id,
      content: msg.content,
      sender: {
        _id: msg.sender._id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        role: msg.sender.role
      },
      messageType: msg.messageType,
      mediaUrl: msg.mediaUrl,
      isRead: msg.isRead,
      readAt: msg.readAt,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      replyTo: msg.replyTo,
      timestamp: msg.createdAt,
      createdAt: msg.createdAt
    }));

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({
      messages: response,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = "text", mediaUrl, replyTo } = req.body;
    const senderId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $elemMatch: { user: senderId } }
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
      messageType,
      mediaUrl: mediaUrl || null,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate("sender", "firstName lastName role");
    await message.populate("replyTo", "content sender");

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const response = {
      _id: message._id,
      content: message.content,
      sender: {
        _id: message.sender._id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        role: message.sender.role
      },
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      isRead: message.isRead,
      readAt: message.readAt,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      replyTo: message.replyTo,
      timestamp: message.createdAt,
      createdAt: message.createdAt
    };

    res.status(201).json({
      message: response,
      conversationId: conversationId
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $elemMatch: { user: userId } }
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all messages in conversation as read for this user
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count for user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      conversation: {
        $in: await Conversation.find({
          participants: { $elemMatch: { user: userId } }
        }).distinct('_id')
      },
      sender: { $ne: userId },
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Soft delete by updating content
    message.content = "This message was deleted";
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ message: error.message });
  }
};
