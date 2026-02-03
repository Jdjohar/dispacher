const express = require("express");
const router = express.Router();
const cloudinary = require("./config/cloudinary");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { auth } = require("./middlewares/auth");

router.post("/", auth, upload.array("images"), async (req, res) => {
  try {
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "job-proofs" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        stream.end(fileBuffer);
      });
    };

    const urls = [];

    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      urls.push(url);
    }

    res.json({ urls });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});


module.exports = router;
