const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadPlayers,
  getPlayers,
  getPlayerByIndex,
  getAuctionOrder
} = require("../controllers/playerController");

const router = express.Router();

// Multer setup (Excel/CSV only)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("spreadsheet") ||
    file.mimetype.includes("excel") ||
    file.mimetype.includes("csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel/CSV files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.post("/upload", upload.single("file"), uploadPlayers);
router.get("/", getPlayers);
router.get("/auction-order", getAuctionOrder);   // ✅ new
router.get("/:index", getPlayerByIndex);

module.exports = router;
