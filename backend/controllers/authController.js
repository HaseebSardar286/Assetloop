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
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new pending user instead of active user
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
      status: "pending",
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
    if (!user)
      return res
        .status(403)
        .json({ message: "Account not approved yet or does not exist" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
