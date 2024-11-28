const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Define the upload directory path
const uploadDirectory = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists before storing files
    cb(null, uploadDirectory); // Files will be stored in the "uploads" directory
  },
  filename: (req, file, cb) => {
    // Save files with a unique name to avoid conflicts
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Set up the upload instance with the file size limit and file type validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx|txt/; // Allowed file extensions
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true); // Accept the file
    } else {
      cb("Error: Invalid file type!"); // Reject invalid file types
    }
  },
});

module.exports = upload;
