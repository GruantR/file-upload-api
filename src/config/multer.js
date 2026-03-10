//src/config/multer.js
const multer = require("multer");
const path = require("path");
const UPLOAD_DIR = "./uploads";

const allowedTypes = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, extension);
    const cleanedName =
      basename
        .replace(/\s+/g, "-") // пробелы → дефисы
        .replace(/[^a-zA-Z0-9-_]/g, "") // убрать спецсимволы
        .replace(/-+/g, "-") // несколько дефисов → один
        .substring(0, 50) || "file";

    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);

    const newFileName = `${timestamp}-${random}-${cleanedName}${extension}`;
    callback(null, newFileName);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.split(";")[0];
  if (
    !extension ||
    !mimeType ||
    !allowedTypes[mimeType] ||
    !allowedTypes[mimeType].includes(extension)
  ) {
    return callback(new Error("Недопустимый тип файла"), false);
  }
  return callback(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

//multer() - Это конструктор, который создаёт middleware на основе твоих настроек. Без вызова multer() — это просто объект.
module.exports = upload;
