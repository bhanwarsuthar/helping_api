const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { Media } = require("../models");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { CommonResponse } = require("../response/successResponse");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, .webp and .jpeg format allowed!"));
    }
  },
});

router.post("/photos/single", upload.single("photo"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json(new CommonResponse(400, "No image file provided"));
    }

    const uuid = uuidv4();
    const destination = path.join("uploads", uuid);
    const destinationAbs = path.join(__basedir, destination);
    await fs.promises.mkdir(destinationAbs, { recursive: true });

    const pic_thumbnail = path.join(destination, "pic_thumbnail.webp");
    const pic_medium = path.join(destination, "pic_medium.webp");
    const pic_large = path.join(destination, "pic_large.webp");
    const mediaPath = pic_large;

    const thumbnailBuffer = await sharp(file.buffer)
      .resize({ width: 150, height: 150, fit: "inside" })
      .toFormat("webp")
      .toBuffer();
    await fs.promises.writeFile(path.join(__basedir, pic_thumbnail), thumbnailBuffer);

    const mediumBuffer = await sharp(file.buffer)
      .resize({ width: 400, height: 400, fit: "inside" })
      .toFormat("webp")
      .toBuffer();
    await fs.promises.writeFile(path.join(__basedir, pic_medium), mediumBuffer);

    const largeBuffer = await sharp(file.buffer)
      .resize({ width: 1080, height: 1080, fit: "inside" })
      .toFormat("webp")
      .toBuffer();
    await fs.promises.writeFile(path.join(__basedir, pic_large), largeBuffer);

    const media = await Media.create({
      uuid: uuid,
      path: mediaPath.replace(/\\/g, "/"),
      mime: file.mimetype,
      name: file.originalname,
      disk: "local",
      type: "image",
      pic_thumbnail: pic_thumbnail.replace(/\\/g, "/"),
      pic_medium: pic_medium.replace(/\\/g, "/"),
      pic_large: pic_large.replace(/\\/g, "/"),
      collection: "temp",
    });

    return res.json(
      new CommonResponse(200, "successfully uploaded.", {
        uuid: media.uuid,
        name: media.name,
        path: media.path,
        pic_thumbnail: media.pic_thumbnail,
        pic_medium: media.pic_medium,
        pic_large: media.pic_large,
      }),
    );
  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json(new CommonResponse(500, err.message || "Upload failed"));
  }
});

module.exports = router;
