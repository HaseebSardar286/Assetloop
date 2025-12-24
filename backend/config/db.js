const mongoose = require("mongoose");

let isConnected = false; // Track connection status

const connectDB = async () => {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    // Prevent multiple simultaneous connection attempts
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      console.log("✅ MongoDB already connected");
      return;
    }

    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB connection in progress...");
      return;
    }

    // Set mongoose options for serverless environment
    mongoose.set('strictQuery', false);
    
    const db = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pooling for serverless
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections to keep open
      
      // Timeouts optimized for serverless
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
      
      // Buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Other options
      maxIdleTimeMS: 10000, // Close connections after 10 seconds of inactivity
    });

    isConnected = db.connections[0].readyState === 1;
    console.log(`✅ MongoDB Connected: ${db.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
      isConnected = false;
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    isConnected = false;
    
    // In serverless, don't exit the process - just throw the error
    // Let Vercel handle the cleanup
    throw error;
  }
};

module.exports = connectDB;