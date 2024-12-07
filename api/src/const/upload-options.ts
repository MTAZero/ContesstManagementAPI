import { editFileName, fileFilter } from 'src/utils';
import { archiveConfig } from './../configs/configuration.config';
import { diskStorage } from 'multer';


const destination = archiveConfig().folder_saved

export const uploadFileOption = {
    storage: diskStorage({
        destination: destination,
        filename: editFileName,
    }),
    fileFilter: fileFilter,
};

export const uploadMultipleFileOption = {
    storage: diskStorage({
        destination: destination,
        filename: editFileName,
    }),
    fileFilter: fileFilter,
};