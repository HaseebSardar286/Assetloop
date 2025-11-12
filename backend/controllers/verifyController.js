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
    const timestamp = Date.now();
    
    // Upload files sequentially to avoid overwhelming Supabase and get better error messages
    // Upload in parallel for better performance, but with better error handling
    let idFrontResult, idBackResult, selfieResult;
    try {
      console.log(`Starting uploads for user ${userId}...`);
      [idFrontResult, idBackResult, selfieResult] = await Promise.all([
        uploadToSupabase(
          files.idFront[0].path,
          `${userId}/id_front_${timestamp}.jpg`,
          bucket
        ),
        uploadToSupabase(
          files.idBack[0].path,
          `${userId}/id_back_${timestamp}.jpg`,
          bucket
        ),
        uploadToSupabase(
          files.selfie[0].path,
          `${userId}/selfie_${timestamp}.jpg`,
          bucket
        ),
      ]);
      console.log(`All uploads completed successfully for user ${userId}`);
    } catch (uploadError) {
      // Log detailed error information
      console.error(`Upload error for user ${userId}:`, {
        message: uploadError.message,
        stack: uploadError.stack,
        name: uploadError.name
      });
      // Clean up temporary files before throwing
      await Promise.all(
        filePaths.map((filePath) => fs.unlink(filePath).catch((err) => {
          console.warn(`Failed to delete temporary file ${filePath}:`, err.message);
        }))
      );
      throw uploadError;
    }

    // Clean up temporary files after successful upload
    await Promise.all(
      filePaths.map((filePath) => fs.unlink(filePath).catch((err) => {
        console.warn(`Failed to delete temporary file ${filePath}:`, err.message);
      }))
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
    // Log the full error for debugging
    console.error('Verification submission error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.body.pendingUserId || req.user?.id
    });
    
    // Return a user-friendly error message
    const errorMessage = error.message || 'An unexpected error occurred during verification submission';
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

async function uploadToSupabase(filePath, fileName, bucket) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      throw new Error("Supabase client is not initialized. Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }

    // Check if Supabase is configured (can use either service role key or anon key)
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
    const hasUrl = !!process.env.SUPABASE_URL;
    const supabaseUrl = process.env.SUPABASE_URL;
    
    if (!hasUrl || (!hasServiceKey && !hasAnonKey)) {
      throw new Error("Supabase is not properly configured. Please ensure SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are set in your .env file. Note: SUPABASE_SERVICE_ROLE_KEY is recommended for server-side operations.");
    }
    
    // Warn if using anon key instead of service role key
    if (!hasServiceKey && hasAnonKey) {
      console.warn("Warning: Using SUPABASE_ANON_KEY instead of SUPABASE_SERVICE_ROLE_KEY. Storage operations may fail due to permissions. Please use SUPABASE_SERVICE_ROLE_KEY for server-side operations.");
    }
    
    // Log Supabase URL (masked) for debugging
    if (supabaseUrl) {
      try {
        const maskedUrl = supabaseUrl.replace(/https?:\/\//, '').split('/')[0];
        console.log(`Attempting upload to Supabase: ${maskedUrl}`);
      } catch (e) {
        // Ignore URL parsing errors
      }
    }

    // Read the file
    const file = await fs.readFile(filePath);

    // Try to upload first - this is more efficient and avoids permission issues with listBuckets
    let uploadError = null;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        upsert: true, 
        contentType: "image/jpeg",
        cacheControl: '3600'
      });

    uploadError = uploadErr;

    // If upload fails, handle the error
    if (uploadError) {
      const errorMessage = uploadError.message || '';
      const errorStatus = uploadError.statusCode || uploadError.status || '';
      const errorCode = uploadError.error || uploadError.code || '';
      
      // Check if it's a network/connectivity error first
      const isNetworkError = 
        errorMessage.includes('fetch failed') || 
        errorMessage.includes('network') || 
        errorMessage.includes('ECONNREFUSED') || 
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ECONNRESET') ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ENOTFOUND';
      
      if (isNetworkError) {
        console.error(`Network error while uploading ${fileName}:`, {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          url: supabaseUrl
        });
        throw new Error(`Network error while uploading to Supabase: ${errorMessage}. Please check your internet connection and verify that your SUPABASE_URL (${supabaseUrl}) is correct and accessible.`);
      }
      
      // Check if the error is because the bucket doesn't exist
      const isBucketNotFound = 
        errorMessage.includes('Bucket not found') || 
        errorMessage.includes('not found') || 
        errorMessage.includes('does not exist') ||
        errorStatus === 404 ||
        errorCode === 'NotFound' ||
        errorMessage.toLowerCase().includes('bucket') && errorMessage.toLowerCase().includes('not found');
      
      if (isBucketNotFound) {
        console.log(`Bucket '${bucket}' not found, attempting to create it...`);
        
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket(bucket, { 
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
        });
        
        if (createError) {
          // If bucket creation fails, it might already exist (race condition)
          // Or it might be a permissions issue
          if (createError.message && !createError.message.includes('already exists') && !createError.message.includes('Duplicate')) {
            console.error(`Error creating bucket:`, createError);
            throw new Error(`Unable to create storage bucket '${bucket}': ${createError.message}. Please ensure your Supabase service role key has storage management permissions.`);
          }
        }
        
        // Retry the upload after creating the bucket
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { 
            upsert: true, 
            contentType: "image/jpeg",
            cacheControl: '3600'
          });
        
        if (retryError) {
          const retryErrorMessage = retryError.message || 'Unknown error';
          console.error(`Upload error after bucket creation for ${fileName}:`, retryError);
          throw new Error(`Failed to upload ${fileName}: ${retryErrorMessage}`);
        }
      } else {
        // If it's a different error, throw it with details
        console.error(`Upload error for ${fileName}:`, {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          error: uploadError
        });
        throw new Error(`Failed to upload ${fileName}: ${errorMessage}`);
      }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error(`Failed to get public URL for ${fileName}`);
    }

    return { publicUrl };
  } catch (error) {
    // Re-throw with more context if it's not already a formatted error
    if (error.message && (error.message.includes('Failed to') || error.message.includes('Network error') || error.message.includes('Unable to'))) {
      throw error;
    }
    // Handle network errors
    if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))) {
      throw new Error(`Network error while uploading to Supabase: ${error.message}. Please check your internet connection and Supabase configuration.`);
    }
    // Handle other errors
    throw new Error(`Error uploading ${fileName}: ${error.message || 'Unknown error'}`);
  }
}
