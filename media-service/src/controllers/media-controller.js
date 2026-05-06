const logger = require("../utils/logger");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const Media = require("../models/Media");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file found. PLease add a file and try.");
      return res.status(400).json({
        success: false,
        message: "No file found. PLease add a file and try.",
      });
    }

    const { originalname, mimetype, buffer } = req.file;

    const userId = req.user.userId;

    logger.info(`File details: name= ${originalname}, type= ${mimetype}`);
    logger.info(`Upload to cloudinary starting ...`);

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully. Public id: - ${cloudinaryUploadResult.public_id}`,
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error uploading media", error);
    res.status(500).json({
      success: false,
      message: "Error uploading media",
    });
  }
};

const getAllMedias = async (req, res) => {
  try {
    const result = await Media.find({});

    res
      .status(200)
      .json({ success: true, message: "Medias fetched successfully", result });
  } catch (error) {
    logger.error("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias",
    });
  }
};

module.exports = { uploadMedia, getAllMedias };
