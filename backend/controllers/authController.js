const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
      country,
      city,
      address,
      role,
      terms,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role || !terms) {
      return res
        .status(400)
        .json({
          message:
            "All required fields must be provided, including agreeing to terms",
        });
    }

    // Check if terms is true
    if (terms !== true) {
      return res.status(400).json({ message: "You must agree to the terms" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if pending user already exists
    const pendingUserExists = await PendingUser.findOne({ email });
    if (pendingUserExists) {
      return res.status(400).json({ message: "Registration already pending" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new pending user with all fields
    const pendingUser = await PendingUser.create({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      country,
      city,
      address,
      role,
      terms,
      verificationStatus: "pending",
      totalSpent: 0, // Explicitly set default
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        pushEnabled: false,
        newBookings: true,
        bookingConfirmations: true,
        bookingCancellations: true,
        activeReminders: true,
        completedBookings: true,
        pendingReviews: true,
        assetStatusChanges: true,
        paymentUpdates: true,
        systemUpdates: true,
        frequency: "immediate",
        reminderThreshold: 1,
        email: email, // Use provided email
        phoneNumber: phoneNumber || undefined,
      },
    });

    res.status(201).json({
      message: "Registration received. Please complete verification.",
      pendingUserId: pendingUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find active user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ message: "Account not approved yet or does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT with additional fields
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        country: user.country,
        city: user.city,
        address: user.address,
        totalSpent: user.totalSpent,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        terms: user.terms,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
