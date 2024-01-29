import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import User from '../models/user.models';
import AppError from '../utils/AppError';
import IUser from '../interfaces/user.interface';
import * as factory from '../utils/handleFactory';

interface Request extends ExpressRequest {
  user?: IUser;
}

export const createUser = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: 'This route is not defined! Please use /signup instead',
  });
};

export const getUsers = factory.readAll(User);
export const getUser = factory.readOne(User);
export const updateUser = factory.updateOne(User); // NOTE: Don't update password with this; Because when using findByIdAndUpdate, all 'save' middlwares will not run
export const deleteUser = factory.deleteOne(User);

// =============== Manage My Own User Account ================ //

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id as string;
  next();
};

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Throw an Error if user want to update his Password
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This Endpoint is not for password updates. Please use /update-password instead.', 400));

  // 2) Filter out unwanted fields that are not allowed to be updated by passing the allowed fields ONLY
  const filterBody = filterObj(req.body, 'name', 'email'); // add more values that you want to include later

  // 3) Update User's data
  const updatedUser = await User.findByIdAndUpdate(req.user?.id, filterBody, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate(req.user?.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const filterObj = (reqBody: any, ...allowedFields: string[]) => {
  const newObj: any = {};

  Object.keys(reqBody).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = reqBody[el];
  });

  return newObj;
};
