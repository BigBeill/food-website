const fs = require('fs');
const multer = require('multer');
const path = require('path');

const volumeDirectory = '/mnt/volume';

const storage = multer.diskStorage({
   destination: (_req, _file, cb) => { cb(null, volumeDirectory); },
   filename: (req, file, cb) => {
      const ext = path.extname(file.originalname|| "").toLowerCase();
      const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
      const safeExt = allowed.has(ext) ? ext : ".bin";
      const userId = (req.user && (req.user._id || req.user.id)) || "anon";
      cb(null, `${userId}-${Date.now()}${safeExt}`);
   }
});

function checkVolumeExists() {
   if (!fs.existsSync(volumeDirectory)) { console.error(`Directory ${volumeDirectory} does not exist.`); }
}

function fileFilter(_req, file, cb) {
   if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) cb(null, true);
   else cb(new Error("Only image uploads are allowed"));
}

function uploadVolumeFile(){
   checkVolumeExists();
   return multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
   }).single("image");
}

module.exports = {
   uploadVolumeFile
}