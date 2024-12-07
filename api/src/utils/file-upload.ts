import { extname } from "path";

export const fileFilter = (req, file, callback) => {
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const date = new Date().getTime().toString();

  const randomName = Array(8)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join("");
  callback(null, `${randomName}-${date}${fileExtName}`);
};

import { diskStorage } from "multer";

export const multerOptions = {
  storage: diskStorage({
    destination: "./uploads", // Lưu file trong thư mục tạm
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      callback(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
};
