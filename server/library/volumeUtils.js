const fs = require('fs');
const multer = require('multer');
const NodeClam = require('clamscan');
const path = require('path');
require('dotenv').config();

const volumeDirectory = path.join(__dirname, '../mnt/volume');

const buckets = Object.freeze({
  users: "uploads/users",
  recipes: "uploads/recipes",
});

let _avInit;
async function getAV() {
   if (!_avInit) {
      _avInit = new NodeClam().init({
         removeInfected: false,
         quarantineInfected: false,
         clamdscan: {
         // Prefer a UNIX socket if you provide one; else host/port.
         socket: process.env.CLAMD_SOCKET || false,
         host: process.env.CLAMAV_HOST || 'clamav',              // e.g. your Railway service name
         port: +(process.env.CLAMAV_PORT || 3310),
         timeout: 120000
         },
         clamscan: { path: process.env.CLAMSCAN_PATH || '/usr/bin/clamscan' }, // fallback
         preference: 'clamdscan'
      });
   }
   return _avInit;
}

async function isFileClean(filePath) {
   const av = await getAV();
   const { isInfected/*, viruses*/ } = await av.isInfected(filePath);
   return !isInfected;
}

const TMP_REL = 'uploads/.tmp';

function ensureTempDir() {
   const base = path.resolve(volumeDirectory);
   const tmpAbs = path.resolve(base, TMP_REL);

   // create (race-safe)
   fs.mkdirSync(tmpAbs, { recursive: true, mode: 0o700 });

   const st = fs.lstatSync(tmpAbs);
   if (st.isSymbolicLink()) throw new Error(`Temp dir must not be symlink: ${tmpAbs}`);
   if (!st.isDirectory()) throw new Error(`Temp path is not dir: ${tmpAbs}`);

   const realBase = fs.realpathSync.native(base);
   const realTmp  = fs.realpathSync.native(tmpAbs);
   if (!realTmp.startsWith(realBase + path.sep) && realTmp !== realBase) {
      throw new Error('Temp dir escapes volume root');
   }

   fs.accessSync(realTmp, fs.constants.W_OK);
   return realTmp;
}

// Verify volume layout at startup
function verifyVolumeLayout() {

   // Ensure the volume root exists and is a directory
   const baseDirectory = path.resolve(volumeDirectory);

   if (!fs.existsSync(baseDirectory)) { throw new Error(`Volume root not found: ${baseDirectory}`); }
   const baseStatus = fs.lstatSync(baseDirectory);
   if (baseStatus.isSymbolicLink()) { throw new Error(`Volume root must not be a symlink: ${baseDirectory}`); }
   if (!baseStatus.isDirectory()) { throw new Error(`Volume root is not a directory: ${baseDirectory}`); }

   const normalizedBase = fs.realpathSync.native(baseDirectory);

   // Ensure each bucket exists, is a directory, and is writable
   for (const key of Object.keys(buckets)) {

      // Basic sanity on the configured bucket path
      if (path.isAbsolute(buckets[key]) || buckets[key].split(/[\\/]+/).some(s => !s || s === "." || s === "..")) { throw new Error(`Invalid bucket path for "${key}": ${buckets[key]}`); }

      // Walk existing parents to ensure no symlinks/non-dirs before we create anything
      const parts = buckets[key].split(/[\\/]+/).filter(Boolean);
      let walk = normalizedBase;
      for (const folder of parts.slice(0, -1)) {
         walk = path.join(walk, folder);
         if (fs.existsSync(walk)) {
            const status = fs.lstatSync(walk);
            if (status.isSymbolicLink()) { throw new Error(`Symlink not allowed in bucket path: ${walk}`); }
            if (!status.isDirectory()) { throw new Error(`Non-directory path segment in bucket path: ${walk}`); }
         }
      }

      const bucketDirectory = path.resolve(baseDirectory, buckets[key]);

      // Make sure bucket exists
      if (!fs.existsSync(bucketDirectory)) { fs.mkdirSync(bucketDirectory, { recursive: true, mode: 0o700 }); }

      // Make sure bucket is a valid directory
      const bucketStatus = fs.lstatSync(bucketDirectory);
      if (!bucketStatus.isDirectory()) { throw new Error(`Bucket "${key}" is not a directory: ${bucketDirectory}`); }
      if (bucketStatus.isSymbolicLink()) { throw new Error(`Bucket "${key}" must not be a symlink: ${bucketDirectory}`); }

      // Prevent traversal or symlink escape
      const normalizedBucket = fs.realpathSync.native(bucketDirectory);
      if (!normalizedBucket.startsWith(normalizedBase + path.sep) && normalizedBucket !== normalizedBase) { throw new Error(`Bucket "${key}" escapes volume root: ${buckets[key]}`); }

      // Make sure bucket is writable
      try { fs.accessSync(bucketDirectory, fs.constants.W_OK); } 
      catch { throw new Error(`Bucket "${key}" not writable: ${bucketDirectory}`); }
   }

   ensureTempDir();
}

// find the absolute path for a bucket key, ensuring it's valid
function findSubdirectory(bucketKey) {
   const subdirectory = buckets[bucketKey];
   if (!subdirectory) { throw new Error(`Invalid bucket: ${bucketKey}`); }
   const basePath = path.resolve(volumeDirectory);
   const absolutePath = path.resolve(basePath, subdirectory);

   if (!absolutePath.startsWith(basePath + path.sep) && absolutePath !== basePath) { throw new Error("Invalid upload folder."); }
   return absolutePath;
}

function fileFilter(_req, file, cb) {
   if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) { cb(null, true); }
   else { cb(new Error("Only image uploads are allowed")); }
}

function storage(destination) {
   return multer.diskStorage({
      destination: (_req, _file, cb) => {
         try {
            if (!fs.existsSync(destination)) { return cb(new Error("Upload folder not found")); }

            const status = fs.lstatSync(destination);
            if (!status.isDirectory()) { return cb(new Error("Upload folder is not a directory")); }
            if (status.isSymbolicLink()) { return cb(new Error("Upload folder must not be a symlink")); }

            const base = path.resolve(volumeDirectory);
            const realBase = fs.realpathSync.native(base);
            const realDestination = fs.realpathSync.native(destination);
            if (!realDestination.startsWith(realBase + path.sep) && realDestination !== realBase) { return cb(new Error("Upload directory escapes volume root")); }

            fs.accessSync(realDestination, fs.constants.W_OK);
            cb(null, realDestination);
         }
         catch (error) { 
            cb(error); 
         }
      },
      filename: (req, file, cb) => {
         const ext = (path.extname(file.originalname || "") || "").toLowerCase();
         const allowed = new Set([".png", ".jpg", ".jpeg", ".webp"]);
         const safeExt = allowed.has(ext) ? ext : ".bin";
         const userId = (req.user && (req.user._id || req.user.id)) || "anon";
         cb(null, `${userId}-${Date.now()}${safeExt}`);
      },
   });
}

function uploadVolumeFile(bucketKey) {
   const temporaryDirectory = ensureTempDir();
   const toTemp = multer({
      storage: storage(temporaryDirectory),
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
   }).single('image');

   // 2) after write, scan -> move or delete
   return (req, res, next) => {
      toTemp(req, res, async (error) => {
         if (error) return next(error);
         try {
            if (!req.file?.path || !req.file?.filename) {
               return next(new Error('No file uploaded'));
            }

            const clean = await isFileClean(req.file.path);
            if (!clean) {
               // infected: delete from temp and block
               try { fs.unlinkSync(req.file.path); } catch {}
               return next(new Error('Upload blocked: antivirus detected malware'));
            }

            // clean: move into final bucket (atomic rename within same volume)
            const finalDirectory = findSubdirectory(bucketKey);
            const finalPath = path.join(finalDirectory, req.file.filename);
            fs.renameSync(req.file.path, finalPath);

            // update req.file so downstream code still works
            req.file.destination = finalDirectory;
            req.file.path = finalPath;

            return next();
         } 
         catch (error) {
            return next(error);
         }
      });
   };
}

// Allowed file extensions for deletion
const ALLOWED_DELETE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bin']);

function isSafeBasename(name) {
   if (typeof name !== "string" || name.length === 0 || name.length > 255) { return false; }
   // Make sure there are no path separators (/, \) or other path-related issues
   if (path.basename(name) !== name) { return false; }
   // Make sure there are no suspicious patterns
   if (name.includes("..") || !/^[A-Za-z0-9._-]+$/.test(name)) { return false; }
   // Ensure the file has an allowed extension
   if (!ALLOWED_DELETE_EXTS.has(path.extname(name).toLowerCase())) { return false; }
   return true;
}

function deleteVolumeFile(bucketKey, filename) {
   if (!isSafeBasename(filename)) { throw new Error("Unsafe filename for deletion"); }

   const directory = findSubdirectory(bucketKey);
   const filePath = path.join(directory, filename);

   // Prevent path traversal or escape
   if (!filePath.startsWith(directory + path.sep)) { throw new Error("Path escape attempt"); }

   // attempt to delete the file if it exists
   try {
      const status = fs.lstatSync(filePath);
      if (status.isDirectory()) { throw new Error("Refusing to delete a directory"); }
      fs.unlinkSync(filePath);
      return true;
   } 
   catch (error) {
      if (error.code === "ENOENT") { return false; }
      throw error;
   }
}

module.exports = {
   verifyVolumeLayout,
   uploadVolumeFile,
   deleteVolumeFile
}