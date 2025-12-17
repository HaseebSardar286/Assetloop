const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


console.log("SMTP_USERNAME at runtime:", process.env.SMTP_USERNAME);
  console.log("SMTP_PASSWORD present:", !!process.env.SMTP_PASSWORD);
function createTransport() {
  console.log("SMTP_USERNAME at runtime:", process.env.SMTP_USERNAME);
  console.log("SMTP_PASSWORD present:", !!process.env.SMTP_PASSWORD);
  if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials are missing in environment variables");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}


async function sendResetEmail(to, token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
  const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

  const transport = createTransport(); // 👈 CREATED HERE

  await transport.sendMail({
    from: `AssetLoop <${process.env.SMTP_USERNAME}>`,
    to,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <a href="${resetLink}">Reset your password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

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

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    // To avoid leaking existence, respond success even if not found
    if (!user) {
      return res
        .status(200)
        .json({ message: "A reset email has been sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendResetEmail(email, token);

    res
      .status(200)
      .json({ message: "A reset email has been sent" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: error.message });
  }
};
