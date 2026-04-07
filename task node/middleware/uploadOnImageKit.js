const multer = require("multer");
const AppError = require("../utils/AppError");
const { getImageKit } = require("../config/imagekit");

const memory = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image uploads are allowed", 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: memory,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

/**
 * After multer.array('images'). Uploads buffers to ImageKit and sets req.imageUrls (string[]).
 */
function uploadOnImageKit({ required = true } = {}) {
  return async function run(req, res, next) {
    if (!req.files || !req.files.length) {
      if (required) {
        return next(new AppError("At least one image is required", 400));
      }
      req.imageUrls = [];
      return next();
    }

    try {
      const imagekit = getImageKit();
      const urls = [];

      for (const file of req.files) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
          folder: process.env.IMAGEKIT_FOLDER || "/blog",
        });
        urls.push(result.url);
      }

      req.imageUrls = urls;
      next();
    } catch (err) {
      next(err instanceof AppError ? err : new AppError(err.message || "Image upload failed", 500));
    }
  };
}

module.exports = { upload, uploadOnImageKit };
