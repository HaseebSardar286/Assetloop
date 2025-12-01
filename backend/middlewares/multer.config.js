const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Serverless platforms (e.g. Vercel) only allow writing under /tmp.
const baseUploadDir =
  process.env.VERCEL || process.env.AWS_REGION ? os.tmpdir() : process.cwd();
const uploadDir = path.join(baseUploadDir, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ensure 'uploads' folder exists in project root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed!"), false);
    }
  },
});

module.exports = upload;
