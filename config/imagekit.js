const ImageKit = require("imagekit");

function getImageKit() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit env vars missing: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT"
    );
  }

  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

module.exports = { getImageKit };
