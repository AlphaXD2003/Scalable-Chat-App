const { v2: cloudinary } = require("cloudinary");
const path = require("path");
const fs = require("fs");
module.exports = async function (localpath) {
  console.log("Localpath: ", localpath);
  // Configuration
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    // Upload an image
    const ext = path.extname(
      `${localpath?.replace("public/temp/avatar/", "")}`
    );
    const uploadResult = await cloudinary.uploader
      .upload(localpath, {
        public_id: `${localpath
          ?.replace("public/temp/avatar/", "")
          ?.replace(ext, "")}`,
      })
      .catch((error) => {
        console.log(error);
      });

    return uploadResult.secure_url;
  } catch (error) {
    fs.unlink(localpath);
    return null;
  }
};
