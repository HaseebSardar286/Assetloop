const Asset = require("../models/Asset");

exports.createAsset = async (req, res) => {
  try {
    const asset = new Asset({ ...req.body, owner: req.user.id });
    await asset.save();
    res.status(201).json({ message: "Asset Created successfully", asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user.id });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { ...req.body, owner: req.user.id },
      { new: true }
    );
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
