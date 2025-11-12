const Asset = require("../models/Asset");
const Joi = require("joi");
const Booking = require("../models/Bookings");
const supabase = require("../services/supabase.service");
const fs = require("fs").promises;

const assetSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  startDate: Joi.string().optional().allow(""),
  endDate: Joi.string().optional().allow(""),
  availability: Joi.string().valid("available", "unavailable").required(),
  category: Joi.string().valid("car", "apartment", "house", "tool").required(),
  capacity: Joi.number().required().min(1),
  images: Joi.array().items(Joi.string()).optional(),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid("Active", "Inactive").required(),
});

exports.createAsset = async (req, res) => {
  try {
    // Normalize multipart text fields before validation
    const normalizedBody = { ...req.body };
    if (typeof normalizedBody.features === "string") {
      try {
        normalizedBody.features = JSON.parse(normalizedBody.features);
      } catch {
        normalizedBody.features = [];
      }
    }
    if (typeof normalizedBody.amenities === "string") {
      try {
        normalizedBody.amenities = JSON.parse(normalizedBody.amenities);
      } catch {
        normalizedBody.amenities = [];
      }
    }
    if (typeof normalizedBody.price === "string") {
      normalizedBody.price = Number(normalizedBody.price);
    }
    if (typeof normalizedBody.capacity === "string") {
      normalizedBody.capacity = Number(normalizedBody.capacity);
    }

    const { error } = assetSchema.validate(normalizedBody, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((d) => d.message).join(", ") });

    const {
      name,
      address,
      description,
      price,
      startDate,
      endDate,
      status,
      availability,
      category,
      capacity,
      features,
      amenities,
    } = normalizedBody;

    const files = req.files || [];
    if (!files.length)
      return res.status(400).json({ message: "At least one image required" });

    const filePaths = files.map((file) => file.path);
    for (const filePath of filePaths) {
      await fs.access(filePath).catch(() => {
        throw new Error(`File not found: ${filePath}`);
      });
    }

    const bucket = "asset-images";
    const imageUrls = await Promise.all(
      files.map((file, index) =>
        uploadToSupabase(
          file.path,
          `${req.user.id}/asset_${Date.now()}_${index}.jpg`,
          bucket
        )
      )
    );

    await Promise.all(
      filePaths.map((filePath) => fs.unlink(filePath).catch(() => {}))
    );

    const asset = new Asset({
      owner: req.user.id,
      name,
      address,
      description,
      price: Number(price),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      availability,
      category,
      capacity: Number(capacity),
      images: imageUrls.map((result) => result.publicUrl),
      features: features || [],
      amenities: amenities || [],
    });

    await asset.save();

    res.status(201).json({
      message: "Asset created successfully",
      asset: {
        _id: asset._id.toString(),
        id: asset._id.toString(),
        owner: asset.owner.toString(),
        name,
        address,
        description,
        price: asset.price,
        startDate: asset.startDate,
        endDate: asset.endDate,
        status,
        availability,
        category,
        capacity: asset.capacity,
        images: asset.images,
        features: asset.features,
        amenities: asset.amenities,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user.id }).lean();
    const response = assets.map((asset) => ({
      _id: asset._id.toString(),
      id: asset._id.toString(),
      owner: asset.owner.toString(),
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      availability: asset.availability,
      category: asset.category,
      capacity: asset.capacity,
      startDate: asset.startDate,
      endDate: asset.endDate,
      images: asset.images,
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate("owner", "firstName lastName email")
      .lean();
    const response = assets.map((asset) => ({
      _id: asset._id.toString(),
      id: asset._id.toString(),
      owner: {
        id: asset.owner._id.toString(),
        name: `${asset.owner.firstName} ${asset.owner.lastName}`,
        email: asset.owner.email,
      },
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      availability: asset.availability,
      category: asset.category,
      capacity: asset.capacity,
      startDate: asset.startDate,
      endDate: asset.endDate,
      images: asset.images,
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));
    res.status(200).json({ assets: response });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    // Normalize multipart text fields for partial updates
    const normalizedBody = { ...req.body };
    if (typeof normalizedBody.features === "string") {
      try {
        normalizedBody.features = JSON.parse(normalizedBody.features);
      } catch {
        delete normalizedBody.features; // ignore malformed string
      }
    }
    if (typeof normalizedBody.amenities === "string") {
      try {
        normalizedBody.amenities = JSON.parse(normalizedBody.amenities);
      } catch {
        delete normalizedBody.amenities; // ignore malformed string
      }
    }
    if (typeof normalizedBody.price === "string") {
      const n = Number(normalizedBody.price);
      if (!Number.isNaN(n)) normalizedBody.price = n;
    }
    if (typeof normalizedBody.capacity === "string") {
      const n = Number(normalizedBody.capacity);
      if (!Number.isNaN(n)) normalizedBody.capacity = n;
    }

    const { error } = assetSchema.validate(normalizedBody, { presence: "optional" });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const files = req.files || [];
    let imageUrls = [];
    if (files.length) {
      const filePaths = files.map((file) => file.path);
      for (const filePath of filePaths) {
        await fs.access(filePath).catch(() => {
          throw new Error(`File not found: ${filePath}`);
        });
      }
      const bucket = "asset-images";
      imageUrls = await Promise.all(
        files.map((file, index) =>
          uploadToSupabase(
            file.path,
            `${req.user.id}/asset_${Date.now()}_${index}.jpg`,
            bucket
          )
        )
      );
      await Promise.all(
        filePaths.map((filePath) => fs.unlink(filePath).catch(() => {}))
      );
    }

    const updateData = { ...normalizedBody };
    if (imageUrls.length) {
      updateData.images = imageUrls.map((result) => result.publicUrl);
    }

    const asset = await Asset.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    res.json({
      _id: asset._id.toString(),
      id: asset._id.toString(),
      owner: asset.owner.toString(),
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      availability: asset.availability,
      category: asset.category,
      capacity: asset.capacity,
      images: asset.images,
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssetReviews = async (req, res) => {
  try {
    const { assetId } = req.params;
    const bookings = await Booking.find({
      asset: assetId,
      review: { $exists: true },
    })
      .populate({ path: "review", select: "rating comment createdAt" })
      .populate({ path: "renter", select: "firstName lastName" })
      .lean();

    const reviews = bookings
      .filter((b) => b.review)
      .map((b) => ({
        rating: b.review.rating,
        comment: b.review.comment,
        createdAt: b.review.createdAt,
        reviewer: `${b.renter?.firstName || ""} ${
          b.renter?.lastName || ""
        }`.trim(),
      }));

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({ 
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
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
