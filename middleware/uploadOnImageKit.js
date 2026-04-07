const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const uploadOnImageKit = () => (req, res, next) => {
  req.imageUrls = [];
  next();
};

module.exports = { upload, uploadOnImageKit };