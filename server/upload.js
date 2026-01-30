const express = require("express");
const router = express.Router();
const cloudinary = require("./config/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { auth } = require("./middlewares/auth");

router.post("/", auth, upload.array("images"), async (req, res) => {
  try {
    const urls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "job-proofs",
      });
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
