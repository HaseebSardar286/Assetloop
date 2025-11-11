const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const supabase = require("../services/supabase.service");
const fs = require("fs").promises;

exports.submitVerification = async (req, res) => {
  try {
    const userId = req.body.pendingUserId || req.user?.id;
    if (!userId)
      return res.status(400).json({ message: "Missing user identifier" });

    const {
      fullName,
      dateOfBirth,
      issueDate,
      expiryDate,
      cnicNumber,
      address,
    } = req.body;
    if (
      !fullName ||
      !dateOfBirth ||
      !issueDate ||
      !expiryDate ||
      !cnicNumber ||
      !address
    ) {
      return res
        .status(400)
        .json({ message: "All verification fields required" });
    }

    const files = req.files || {};
    if (!files.idFront?.[0] || !files.idBack?.[0] || !files.selfie?.[0]) {
      return res
        .status(400)
        .json({ message: "All images (idFront, idBack, selfie) required" });
    }

    const filePaths = [
      files.idFront[0].path,
      files.idBack[0].path,
      files.selfie[0].path,
    ];
    for (const filePath of filePaths) {
      await fs.access(filePath).catch(() => {
        throw new Error(`File not found: ${filePath}`);
      });
    }

    const bucket = "user-verifications";
    const [idFrontResult, idBackResult, selfieResult] = await Promise.all([
      uploadToSupabase(
        files.idFront[0].path,
        `${userId}/id_front_${Date.now()}.jpg`,
        bucket
      ),
      uploadToSupabase(
        files.idBack[0].path,
        `${userId}/id_back_${Date.now()}.jpg`,
        bucket
      ),
      uploadToSupabase(
        files.selfie[0].path,
        `${userId}/selfie_${Date.now()}.jpg`,
        bucket
      ),
    ]);

    await Promise.all(
      filePaths.map((filePath) => fs.unlink(filePath).catch(() => {}))
    );

    const verificationData = {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      cnicNumber,
      address,
      idFront: idFrontResult.publicUrl,
      idBack: idBackResult.publicUrl,
      selfie: selfieResult.publicUrl,
    };

    let updated = await User.findByIdAndUpdate(
      userId,
      { verification: verificationData, verificationStatus: "pending" },
      { new: true }
    );

    if (!updated) {
      updated = await PendingUser.findByIdAndUpdate(
        userId,
        { verification: verificationData, verificationStatus: "pending" },
        { new: true }
      );
    }

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message:
        "Verification submitted successfully. Your request will be approved with 24 hours.",
      redirectToLogin: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function uploadToSupabase(filePath, fileName, bucket) {
  const file = await fs.readFile(filePath);
  const { data: listBuckets } = await supabase.storage.listBuckets();
  if (!listBuckets?.some((b) => b.name === bucket)) {
    await supabase.storage.createBucket(bucket, { public: true });
  }
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true, contentType: "image/jpeg" });
  if (error) throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { publicUrl };
}
