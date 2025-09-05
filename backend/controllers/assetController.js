// Validation schema (for createAsset)
console.log("Loading assetController.js");
const Asset = require("../models/Asset");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/Bookings");

console.log("Defining assetSchema");
const assetSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  startDate: Joi.string().optional().allow(""),
  endDate: Joi.string().optional().allow(""),
  status: Joi.string().valid("available", "unavailable").required(),
  category: Joi.string().valid("car", "apartment", "house", "tool").required(),
  capacity: Joi.number().required().min(1),
  images: Joi.array().items(Joi.string()).optional(),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
});

exports.createAsset = async (req, res) => {
  try {
    console.log("Received request, body:", req.body);
    const { error } = assetSchema.validate(req.body, {
      abortEarly: false,
      convert: false,
    });
    if (error) {
      console.error(
        "Validation errors:",
        error.details.map((d) => ({
          path: d.path,
          message: d.message,
          value: d.context.value,
          type: d.type,
        }))
      );
      return res
        .status(400)
        .json({ message: error.details.map((d) => d.message).join(", ") });
    }

    const {
      name,
      address,
      description,
      price,
      startDate,
      endDate,
      status,
      category,
      capacity,
      images,
      features,
      amenities,
    } = req.body;

    const imagePaths = [];
    if (images && images.length > 0) {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
        const filename = `${Date.now()}-${i}.png`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, base64Data, "base64");
        imagePaths.push(filePath);
      }
    }

    const asset = new Asset({
      owner: req.user.id,
      name,
      address,
      description,
      price: Number(price),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      category,
      capacity: Number(capacity),
      images: imagePaths,
      features: features || [],
      amenities: amenities || [],
    });
    await asset.save();
    console.log("Asset saved:", asset);

    res.status(201).json({
      message: "Asset created successfully",
      asset: {
        _id: asset._id,
        owner: asset.owner,
        name: asset.name,
        address: asset.address,
        description: asset.description,
        price: asset.price,
        startDate: asset.startDate,
        endDate: asset.endDate,
        status: asset.status,
        category: asset.category,
        capacity: asset.capacity,
        images: asset.images,
        features: asset.features,
        amenities: asset.amenities,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in createAsset:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user.id });
    const response = assets.map((asset) => ({
      _id: asset._id,
      owner: asset.owner,
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      category: asset.category,
      capacity: asset.capacity,
      images: asset.images,
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { error } = assetSchema.validate(req.body, { presence: "optional" });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    res.json({
      _id: asset._id,
      owner: asset.owner,
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      category: asset.category,
      capacity: asset.capacity,
      images: asset.images,
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
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

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const currentDate = new Date().toISOString().split("T")[0]; // e.g., "2025-09-05"
    const totalAssets = await Asset.countDocuments({ owner: ownerId });
    const activeBookings = await Booking.countDocuments({
      owner: ownerId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "confirmed",
    });
    const totalEarnings = await Booking.aggregate([
      { $match: { owner: ownerId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]).then((results) => results[0]?.total || 0);
    const pendingReviews = await Booking.countDocuments({
      owner: ownerId,
      status: "completed",
      review: { $exists: false },
    });

    res.status(200).json({
      totalAssets,
      activeBookings,
      totalEarnings,
      pendingReviews,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const currentDate = new Date().toISOString().split("T")[0];

    const activeBookings = await Booking.find({
      owner: ownerId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "confirmed",
    }).populate("asset", "name address price");

    res.status(200).json(activeBookings);
  } catch (error) {
    console.error("Error in getActiveBookings:", error);
    res.status(500).json({ message: error.message });
  }
};
