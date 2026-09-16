import multer from "multer";

export const maxFileSizeBytes = 25 * 1024 * 1024;

export const uploadSingleNote = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
}).single("file");
