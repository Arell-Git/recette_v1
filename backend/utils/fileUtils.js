const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg') {
      // Accept MP3 files
      cb(null, true);
    } else if (file.mimetype === 'video/mp4') {
      // Accept MP4 files
      cb(null, true);
    } else {
      // Reject other file types
      cb(new Error(`Invalid file type. Only MP3 and MP4 files are allowed! You uploaded a ${file.mimetype} file.`), false);
    }
  },
});



const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting file:', err);
  });
};

// module.exports = { upload, deleteFile };
module.exports = { upload, deleteFile }
