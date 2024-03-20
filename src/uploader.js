import multer from "multer";
import path from "path";

const storage = multer.diskStorage({});

export const uploader = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Error: el tipo de archivo no está permitido -" + fileTypes);
  },
});
