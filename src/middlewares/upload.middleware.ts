import { Request as ExpressRequest, Response, NextFunction } from 'express';
import IUser from '../interfaces/user.interface';
import sharp from 'sharp';
import multer, { FileFilterCallback } from 'multer';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface Request extends ExpressRequest {
  user?: IUser;
}

interface UploadedFiles {
  imageCover?: Express.Multer.File[];
  images?: Express.Multer.File[];
}

// const multerStorage = multer.diskStorage({
//   destination: 'src/public/img/users',
//   filename(req: Request, file, callback) {
//     // user-5c8a1f4e2f8fb814b56fa185-1707303459313.png  // To Guarntee no 2 imgs with the same filename (user-id-timestamp.jpeg)
//     const extnsion = file.mimetype.split('/')[1];
//     callback(null, `user-${req.user?.id}-${Date.now()}.${extnsion}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true); // Accept the file
  } else {
    callback(new AppError('Not an image! Please upload only images.', 400)); // Reject the file
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/* 
when it's one       => upload.single('')
when it's multiple  => upload.array('')
when it's mix       => upload.fields([{},{}])
*/

export const uploadPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/users/${req.file.filename}`);

  next();
});

export const uploadTourImgs = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as UploadedFiles; // Type assertion
  if (!files.imageCover || !files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
    files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`src/public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );
  next();
});
