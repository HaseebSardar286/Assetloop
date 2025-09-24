const User = require("../models/User");

exports.submitVerification = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        verification: verificationData,
        verificationStatus: "pending",
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.error("Error in submitVerification:", error);
    res.status(500).json({ message: error.message });
  }
};
