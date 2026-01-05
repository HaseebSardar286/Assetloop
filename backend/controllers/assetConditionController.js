const AssetCondition = require("../models/AssetCondition");
const Booking = require("../models/Bookings");
const supabase = require("../services/supabase.service");
const fs = require("fs").promises;

// Helper to upload to Supabase
async function uploadToSupabase(file, bucket = 'asset-conditions') {
    if (!supabase) throw new Error("Supabase client not initialized");

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Read file buffer
    const fileBuffer = await fs.readFile(file.path);

    // Ensure bucket exists (optional, mostly for first run)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === bucket)) {
        await supabase.storage.createBucket(bucket, { public: true });
    }

    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
            contentType: file.mimetype,
            upsert: true
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    // Clean up local file
    await fs.unlink(file.path).catch(console.error);

    return publicUrl;
}

exports.getAssetCondition = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const condition = await AssetCondition.findOne({ booking: bookingId })
            .populate('beforeConditionUploadedBy', 'firstName lastName')
            .populate('afterConditionUploadedBy', 'firstName lastName');

        // Return empty structure if not found so frontend doesn't crash
        if (!condition) {
            return res.status(200).json({
                beforeImages: [],
                afterImages: [],
                status: 'PENDING'
            });
        }

        res.status(200).json(condition);
    } catch (error) {
        console.error("Error fetching asset condition:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.uploadBeforeImages = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        // Validation
        const booking = await Booking.findById(bookingId).populate('asset');
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Check if user is the OWNER
        // Booking.owner might be an ID or object depending on population? 
        // Usually Booking store owner ID. 
        // Just to be safe, compare stringified IDs.
        const ownerId = booking.owner?._id ? booking.owner._id.toString() : booking.owner.toString();
        if (ownerId !== userId) {
            return res.status(403).json({ message: "Only the owner can upload before images" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        // Upload images
        const imageUrls = [];
        for (const file of req.files) {
            const url = await uploadToSupabase(file);
            imageUrls.push({ url, uploadedAt: new Date() });
        }

        // Update or Create AssetCondition
        let condition = await AssetCondition.findOne({ booking: bookingId });
        if (!condition) {
            condition = new AssetCondition({
                booking: bookingId,
                beforeImages: imageUrls,
                beforeConditionUploadedBy: userId,
                status: "BEFORE_UPLOADED"
            });
        } else {
            condition.beforeImages.push(...imageUrls);
            condition.beforeConditionUploadedBy = userId;
            condition.status = "BEFORE_UPLOADED";
        }

        await condition.save();
        res.status(200).json(condition);

    } catch (error) {
        console.error("Error uploading before images:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.uploadAfterImages = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        // Validation
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Check if user is the RENTER
        const renterId = booking.renter?._id ? booking.renter._id.toString() : booking.renter.toString();
        if (renterId !== userId) {
            return res.status(403).json({ message: "Only the renter can upload after images" });
        }

        // Check if allowed (e.g. Booking must be active or completed?)
        // Requirement says: "Disable 'Upload After Return' until booking is completed" (UI behavior),
        // but backend should probably enforce at least start date passed.
        // user requirement: "Renters upload asset condition images at the time of return."

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        // Upload images
        const imageUrls = [];
        for (const file of req.files) {
            const url = await uploadToSupabase(file);
            imageUrls.push({ url, uploadedAt: new Date() });
        }

        let condition = await AssetCondition.findOne({ booking: bookingId });
        if (!condition) {
            // It's possible ONLY after images are uploaded if owner skipped?
            condition = new AssetCondition({
                booking: bookingId,
                afterImages: imageUrls,
                afterConditionUploadedBy: userId,
                status: "COMPLETED" // If just after is uploaded? Or partial?
            });
        } else {
            condition.afterImages.push(...imageUrls);
            condition.afterConditionUploadedBy = userId;
            condition.status = "COMPLETED";
        }

        await condition.save();
        res.status(200).json(condition);

    } catch (error) {
        console.error("Error uploading after images:", error);
        res.status(500).json({ message: error.message });
    }
};
