const fs = require('fs');
const multer = require('multer');
const NodeClam = require('clamscan');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const volumeDirectory = process.env.SERVER_DIRECTORY ? path.join(process.env.SERVER_DIRECTORY, 'mnt/volume') : '/mnt/volume';

// Define the storage buckets
const buckets = Object.freeze({
   tmp: "uploads/.tmp",
   users: "uploads/users",
   recipes: "uploads/recipes",
});

// Allowed file extensions for deletion
const ALLOWED_DELETE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bin']);

// Prevent path traversal or escape
function checkFilePathSafety(filePath) {
   resolvedPath = path.resolve(filePath);
   if (resolvedPath.startsWith(volumeDirectory + path.sep)) {return true; } 
   else { throw new Error("Path escape attempt"); }
}

let avInit;
async function getAV() {
   if (!avInit) {
      avInit = new NodeClam().init({
         removeInfected: false,
         quarantineInfected: false,
         clamdscan: {
            socket: process.env.CLAMD_SOCKET || false,
            host: process.env.CLAMAV_HOST || 'clamav',
            port: +(process.env.CLAMAV_PORT || 3310),
            timeout: 120000
         },
         clamscan: { path: process.env.CLAMSCAN_PATH || '/usr/bin/clamscan' }, // fallback
         preference: 'clamdscan'
      });
   }
   return avInit;
}

async function isFileClean(filePath) {
   try {
      const av = await getAV();
      const { isInfected } = await av.isInfected(filePath);
      return !isInfected;
   }
   catch (error) {
      console.error('Antivirus scan failed:', error);
      throw new Error('isFileClean function failed:', error);
   }
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
      filename: (_req, file, cb) => {
         const ext = (path.extname(file.originalname || "") || "").toLowerCase();
         const allowed = new Set([".png", ".jpg", ".jpeg", ".webp"]);
         const safeExt = allowed.has(ext) ? ext : ".bin";
         cb(null, `${crypto.randomUUID()}-${Date.now()}${safeExt}`);
      },
   });
}

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

// find the absolute path for a bucket key, ensuring it's valid
function findSubdirectory(bucketKey) {
   const subdirectory = buckets[bucketKey];
   if (!subdirectory) { throw new Error(`Invalid bucket: ${bucketKey}`); }
   const basePath = path.resolve(volumeDirectory);
   const absolutePath = path.resolve(basePath, subdirectory);

   if (!absolutePath.startsWith(basePath + path.sep) && absolutePath !== basePath) { throw new Error("Invalid upload folder."); }
   return absolutePath;
}

// this function should be called on startup to ensure the volume and buckets are correctly setup
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
      if (!fs.existsSync(bucketDirectory)) { fs.mkdirSync(bucketDirectory, { recursive: true, mode: 0o755 }); }

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
}

// this is the first step in the upload process for images provided by the client
// saves the file to the tmp location and scans it for viruses
// IMPORTANT: to avoid memory leaks in between garbage collection, any route that uses this middleware should delete the file from tmp if the request fails later in the chain
// use { if (req.file) { volumeUtils.deleteVolumeFile("tmp", req.file.filename) } } to delete the file
function uploadVolumeFile() {

   const temporaryDirectory = findSubdirectory('tmp');

   const toTemp = multer({
      storage: storage(temporaryDirectory),
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
   }).single('image');

   function moveFileToTemp(req, res, next) {

      toTemp(req, res, async (multerError) => {
         if (multerError) { return next(multerError); }

         // check if file was provided for upload
         if (!req.file?.path || !req.file?.filename) { return next(); }

         // ensure user is authenticated
         if (!req.user) {
            try { fs.unlinkSync(req.file.path); }
            catch(error) { console.error('Server failed to delete temp file from unauthenticated user:', error); }
            return res.status(401).json({ error: "Unauthenticated users cannot upload files" }); 
         }

         try {
            const clean = await isFileClean(req.file.path);
            if (!clean) {
               console.warn('Upload blocked: antivirus detected malware');
               // infected: delete from temp and block
               try { fs.unlinkSync(req.file.path); } 
               catch(error) { console.error('Server failed to delete infected temp file:', error); }
               return res.status(500).json({ error: "Internal server error" }); // generic error to avoid info leak
            }

            req.file.directory = temporaryDirectory;
            req.file.fileName = req.file.filename;

            return next();
         } 
         catch (error) {
            // on any error, try to clean up temp file if it exists
            try { if (req.file?.path && fs.existsSync(req.file.path)) { fs.unlinkSync(req.file.path); } }
            catch (error) { console.error('Temp cleanup failed:', error); }
            return next(error);
         }
      });
   }

   // error handler for multer issues
   function uploadErrorHandler(error, _req, res, next) {
      console.error('File upload error:', error);
      
      if (error instanceof multer.MulterError) {
         if (error.code === 'LIMIT_FILE_SIZE') { return res.status(400).json({ error: 'File too large' }); }
         if (error.code === 'LIMIT_FILE_COUNT') { return res.status(400).json({ error: 'Too many files' }); }
         return res.status(500).json({ error: 'File upload failed' });
      }
      if (error) return res.status(500).json({ error: 'File upload failed' });
      return next();
   }

   return [
      moveFileToTemp,
      uploadErrorHandler
   ];
}

// this is the second step in the upload process for images provided by the client
// moves a file from the tmp bucket to its final bucket
function moveFileToBucket(fileName, currentPath, bucketKey) {
   if (bucketKey == "tmp") { throw new Error("Cannot move file into the temporary bucket"); }

   const finalDirectory = findSubdirectory(bucketKey);
   const finalPath = path.join(finalDirectory, fileName);

   checkFilePathSafety(finalPath);

   fs.renameSync(currentPath, finalPath);

   return finalDirectory;
}

function deleteVolumeFile( bucketKey, filename) {
   if (!isSafeBasename(filename)) { throw new Error("Unsafe filename for deletion"); }

   const directory = findSubdirectory(bucketKey);
   const filePath = path.join(directory, filename);

   checkFilePathSafety(filePath);

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
   moveFileToBucket,
   deleteVolumeFile
}