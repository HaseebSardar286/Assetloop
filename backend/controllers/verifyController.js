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
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !dateOfBirth ||
      !issueDate ||
      !expiryDate ||
      !cnicNumber ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate uploaded files
    if (
      !req.files ||
      !req.files.idFront ||
      !req.files.idBack ||
      !req.files.selfie
    ) {
      return res
        .status(400)
        .json({
          message: "All files (ID front, ID back, selfie) are required",
        });
    }

    const verificationData = {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      cnicNumber,
      address,
      idFront: req.files.idFront[0].path,
      idBack: req.files.idBack[0].path,
      selfie: req.files.selfie[0].path,
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
