console.log("Loading assetController.js");
const Asset = require("../models/Asset");
const Joi = require("joi");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");

console.log("Defining assetSchema");
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
      availability,
      category,
      capacity,
      images,
      features,
      amenities,
    } = req.body;

    const imageBuffers = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
        imageBuffers.push(Buffer.from(base64Data, "base64"));
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
      availability,
      category,
      capacity: Number(capacity),
      images: imageBuffers,
      features: features || [],
      amenities: amenities || [],
    });
    await asset.save();
    console.log("Asset saved:", asset);

    res.status(201).json({
      message: "Asset created successfully",
      asset: {
        _id: asset._id.toString(),
        id: asset._id.toString(), // For compatibility
        owner: asset.owner.toString(),
        name: asset.name,
        address: asset.address,
        description: asset.description,
        price: asset.price,
        startDate: asset.startDate,
        endDate: asset.endDate,
        status: asset.status,
        category: asset.category,
        capacity: asset.capacity,
        images: asset.images.map(
          (img) => `data:image/png;base64,${img.toString("base64")}`
        ),
        features: asset.features,
        amenities: asset.amenities,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
        availability: asset.availability,
      },
    });
  } catch (error) {
    console.error("Error in createAsset:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user.id }).lean();
    const response = assets.map((asset) => ({
      _id: asset._id.toString(),
      id: asset._id.toString(), // For compatibility
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
      images: asset.images.map(
        (img) => `data:image/png;base64,${img.toString("base64")}`
      ),
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
      id: asset._id.toString(), // For compatibility
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
      images: asset.images.map(
        (img) => `data:image/png;base64,${img.toString("base64")}`
      ),
      features: asset.features,
      amenities: asset.amenities,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));

    res.status(200).json({ assets: response });
  } catch (error) {
    console.error(`Error fetching all assets: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { error } = assetSchema.validate(req.body, { presence: "optional" });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let imageBuffers = [];
    if (req.body.images && req.body.images.length > 0) {
      for (let i = 0; i < req.body.images.length; i++) {
        const base64Data = req.body.images[i].replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        imageBuffers.push(Buffer.from(base64Data, "base64"));
      }
      req.body.images = imageBuffers;
    }

    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    res.json({
      _id: asset._id.toString(),
      id: asset._id.toString(), // For compatibility
      owner: asset.owner.toString(),
      name: asset.name,
      address: asset.address,
      description: asset.description,
      price: asset.price,
      status: asset.status,
      availability: asset.availability,
      category: asset.category,
      capacity: asset.capacity,
      images: asset.images.map(
        (img) => `data:image/png;base64,${img.toString("base64")}`
      ),
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

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const currentDate = new Date().toISOString().split("T")[0];
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

// Public/read endpoint to get reviews for a given asset
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

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error in getAssetReviews:", error);
    res.status(500).json({ message: error.message });
  }
};
