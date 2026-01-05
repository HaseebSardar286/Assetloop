const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createDispute, getDisputes } = require("../controllers/disputeController");

router.use(authMiddleware);

router.post("/", createDispute);
router.get("/", getDisputes);

module.exports = router;
