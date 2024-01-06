import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.models';
import AppError from '../utils/AppError';
import IUser from '../interfaces/user.interface';
import { catchAsync } from '../utils/catchAsync';
import { verifyAsync } from '../utils/verifyJwtAsync';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/sendEmail';

interface Request extends ExpressRequest {
  user?: IUser;
}

const createAndSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Remove password and __v properites from the output
  user.password = undefined;
  user.__v = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password is porvided by the user
  if (!email || !password) return next(new AppError('please enter your email and password', 400));

  // 2) check if user exist && pasword is correct in the DB
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password as string)))
    return next(new AppError('email or password incorrect', 401));

  // 3) if everything is okay, send the jwt
  createAndSendToken(user, 200, res);
});

export const authenticate = catchAsync(async (req: Request, res, next) => {
  let token: string = '';
  // 1) check if the token is exist
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError('No authentication token provided. Please include a valid token in the Authorization header.', 401),
    );

  // 2) validate the token
  const decoded = await verifyAsync(token, process.env.JWT_SECRET as string);

  // 3) check if user still exists in DB - (not Deleted)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonged to this token is no longer exist', 401));
  }

  // 4) check if the user changed the password after the token was issued
  if (currentUser.passwordChangedAfter(decoded.iat as number))
    return next(new AppError('user recently changed password please login again!', 401));

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const authorize = (...roles: string[]) => {
  // roles ['admin', 'tour-guide', ...]
  return (req: Request, res: Response, next: NextFunction) => {
    // the User Must be logged-in
    if (!req.user) return next(new AppError('You are not authenticated. Please log in to access this resource.', 401));

    if (!roles.includes(req.user.role as string)) {
      logger?.error(
        `Unauthorized access: User with role ${req.user.role} attempted to perform an unauthorized action.`,
      );

      return next(new AppError("You don't have premissions to preform this action", 403));
    }
    next();
  };
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with this email address', 404));

  // 2) Generate the random reset token password
  const resetToken = await user.createPasswordResetToken();

  // 3) sent it back to user's email
  const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get the temp plain password from the PATCH request params, and Hash to compare it with the stored one
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2) Get user based on the token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: new Date() },
  });

  // 3) Check if token is correct and has not expired, By Checking there is a user document exist
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 4) Set the new password ana save it
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save(); // use .save() instead of update to run the pre('save') middleware for hashing new Password

  // 5) Update changedPasswordAt property for the user
  // Done in the pre('save') Middleware at the Model

  // 6) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req: Request, res, next) => {
  // the User Must be logged-in
  if (!req.user) return next(new AppError('You are not authenticated. Please log in to access this resource.', 401));

  // 1) Get user from DB
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('User you want to update Not found', 404));

  // 2) Check if the current POSTed password is correct
  const currentPassword = req.body.currentPassword;
  if (!(await user.comparePassword(currentPassword, user.password as string)))
    return next(new AppError('current password incorrect', 401));

  // 3) Update the Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log User in, Send JWT
  createAndSendToken(user, 200, res);
});
