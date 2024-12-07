import { extname } from 'path';

export const fileFilter = (req, file, callback) => {
    callback(null, true)
}

export const editFileName = (req, file, callback) => {
    const fileExtName = extname(file.originalname);
    const date = new Date().getTime().toString();

    const randomName = Array(8)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${randomName}-${date}${fileExtName}`);
};