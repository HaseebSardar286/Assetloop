const User = require("../models/User");
const PendingUser = require("../models/PendingUser");

exports.submitVerification = async (req, res) => {
  try {
    const userId = req.body.pendingUserId || req.user?.id; // Allow unauthenticated verification via pendingUserId
    const {
      fullName,
      dateOfBirth,
      issueDate,
      expiryDate,
      cnicNumber,
      address,
      idFront,
      idBack,
      selfie,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !dateOfBirth ||
      !issueDate ||
      !expiryDate ||
      !cnicNumber ||
      !address ||
      !idFront ||
      !idBack ||
      !selfie
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const verificationData = {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      cnicNumber,
      address,
      idFront,
      idBack,
      selfie,
    };

    // If user exists in active users, update there; else update PendingUser
    let updated = await User.findByIdAndUpdate(
      userId,
      {
        verification: verificationData,
        verificationStatus: "pending",
      },
      { new: true }
    );

    if (!updated) {
      updated = await PendingUser.findByIdAndUpdate(
        userId,
        { verification: verificationData, status: "pending" },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    res.status(200).json({
      message:
        "Verification submitted successfully. Please wait for admin approval.",
      redirectToLogin: true,
    });
  } catch (error) {
    console.error("Error in submitVerification:", error);
    res.status(500).json({ message: error.message });
  }
};
