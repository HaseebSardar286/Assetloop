// const User = require("../models/User");
// const PendingUser = require("../models/PendingUser");

// exports.submitVerification = async (req, res) => {
//   try {
//     console.log("Received verification request:", req.body); // Debug log
//     const userId = req.body.pendingUserId || req.user?.id;
//     const {
//       fullName,
//       dateOfBirth,
//       issueDate,
//       expiryDate,
//       cnicNumber,
//       address,
//       idFront,
//       idBack,
//       selfie,
//     } = req.body;

//     // Validate required fields
//     if (
//       !fullName ||
//       !dateOfBirth ||
//       !issueDate ||
//       !expiryDate ||
//       !cnicNumber ||
//       !address ||
//       !idFront ||
//       !idBack ||
//       !selfie
//     ) {
//       console.error("Missing required fields:", {
//         fullName: !!fullName,
//         dateOfBirth: !!dateOfBirth,
//         issueDate: !!issueDate,
//         expiryDate: !!expiryDate,
//         cnicNumber: !!cnicNumber,
//         address: !!address,
//         idFront: !!idFront,
//         idBack: !!idBack,
//         selfie: !!selfie,
//       });
//       return res
//         .status(400)
//         .json({ message: "All verification fields are required" });
//     }

//     const verificationData = {
//       fullName,
//       dateOfBirth: new Date(dateOfBirth),
//       issueDate: new Date(issueDate),
//       expiryDate: new Date(expiryDate),
//       cnicNumber,
//       address,
//       idFront,
//       idBack,
//       selfie,
//     };

//     console.log("Verification data to save:", verificationData); // Debug log

//     // If user exists in active users, update there; else update PendingUser
//     let updated = await User.findByIdAndUpdate(
//       userId,
//       {
//         verification: verificationData,
//         verificationStatus: "pending",
//       },
//       { new: true }
//     );

//     if (!updated) {
//       updated = await PendingUser.findByIdAndUpdate(
//         userId,
//         {
//           verification: verificationData,
//           verificationStatus: "pending",
//         },
//         { new: true }
//       );
//     }

//     if (!updated) {
//       console.error("User or pending user not found for ID:", userId);
//       return res
//         .status(404)
//         .json({ message: "User or pending user not found" });
//     }

//     console.log("Updated document:", updated); // Debug log
//     res.status(200).json({
//       message:
//         "Verification submitted successfully. Please wait for admin approval.",
//       redirectToLogin: true,
//     });
//   } catch (error) {
//     console.error("Error in submitVerification:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const supabase = require("../services/supabase.service");
const fs = require("fs").promises;

exports.submitVerification = async (req, res) => {
  try {
    console.log("Received verification data:", {
      body: req.body,
      files: req.files,
    });

    const userId = req.body.pendingUserId || req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing user identifier (pendingUserId or token)" });
    }
    const {
      fullName,
      dateOfBirth,
      issueDate,
      expiryDate,
      cnicNumber,
      address,
    } = req.body;

    // Validate text fields
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
        .json({ message: "All verification fields are required" });
    }

    // Validate files
    const files = req.files || {};
    if (!files.idFront?.[0] || !files.idBack?.[0] || !files.selfie?.[0]) {
      console.error("Missing required files:", {
        idFront: !!files.idFront,
        idBack: !!files.idBack,
        selfie: !!files.selfie,
      });
      return res.status(400).json({
        message: "All images (idFront, idBack, selfie) are required",
      });
    }

    // Verify file existence
    const filePaths = [
      files.idFront[0].path,
      files.idBack[0].path,
      files.selfie[0].path,
    ];
    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        console.log(`File exists: ${filePath}`);
      } catch (error) {
        console.error(`File not found: ${filePath}`, error);
        return res.status(500).json({ message: `File not found: ${filePath}` });
      }
    }

    // Upload files to Supabase
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

    // Cleanup temporary files
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted temp file: ${filePath}`);
        } catch (error) {
          console.warn(
            `Failed to delete temp file ${filePath}:`,
            error.message
          );
        }
      })
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

    console.log("Verification data to save:", verificationData);

    // Update User or PendingUser
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
        {
          verification: verificationData,
          verificationStatus: "pending",
        },
        { new: true }
      );
    }

    if (!updated) {
      return res
        .status(404)
        .json({ message: "User or pending user not found" });
    }

    console.log("Updated document:", updated);
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

async function uploadToSupabase(filePath, fileName, bucket) {
  try {
    console.log(`Uploading file: ${filePath} to ${bucket}/${fileName}`);
    const file = await fs.readFile(filePath);
    // Ensure bucket exists or create it (requires service role key)
    try {
      const { data: listBuckets, error: listErr } =
        await supabase.storage.listBuckets();
      if (listErr) {
        console.warn("List buckets error:", listErr.message);
      } else if (!listBuckets?.some((b) => b.name === bucket)) {
        const { error: createErr } = await supabase.storage.createBucket(
          bucket,
          {
            public: true,
          }
        );
        if (createErr) {
          console.warn(`Create bucket '${bucket}' error:`, createErr.message);
        } else {
          console.log(`Created bucket '${bucket}'.`);
        }
      }
    } catch (bucketErr) {
      console.warn("Bucket ensure step failed:", bucketErr.message);
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true, contentType: "image/jpeg" });

    if (error) {
      console.error(`Supabase upload error for ${fileName}:`, error);
      throw new Error(`Failed to upload ${fileName}: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);
    console.log(`Uploaded ${fileName} with public URL: ${publicUrl}`);
    return { publicUrl };
  } catch (error) {
    console.error(`Error in uploadToSupabase for ${filePath}:`, error);
    throw error;
  }
}
