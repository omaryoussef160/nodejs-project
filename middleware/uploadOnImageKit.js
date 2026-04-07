const multer = require("multer");

const memory = multer.memoryStorage();

const upload = multer({
  storage: memory,
});

function uploadOnImageKit() {
  return (req, res, next) => {
    req.imageUrls = [];
    next();
  };
}

module.exports = { upload, uploadOnImageKit };