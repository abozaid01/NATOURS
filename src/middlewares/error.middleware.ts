import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
  } else {
    // RENDERD Page
    res.status(err.statusCode).render('error', { title: 'Something went wrong', msg: err.message });
  }
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // 1) API
  if (req.originalUrl.startsWith('/api')) {
    // 1.1) Opertional, trusted Errors : send to client
    if (err.isOpertional)
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    // 1.2) Programming or other Unkown Errors (e.g, 3rd parties packages): Don't leak error details
    else {
      // 1.2.1) log the error
      logger?.error(err);

      // 1.2.2) send generic error
      res.status(500).json({
        status: 'error',
        message: 'somthing went wrog!',
      });
    }
  }
  // 2) RENDERD Page
  else {
    // 2.1) Opertional, trusted Errors : send to client
    if (err.isOpertional)
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    else {
      // 2.2) Programming or other Unkown Errors
      logger?.error(err);
      res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'try again later',
      });
    }
  }
};

const handleCastErrorDB = (err: AppError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeysDB = (err: AppError) => {
  const message = `Duplicate key value: ${err.keyValue?.name}`;
  return new AppError(message, 409); // Conflict
};

const handleValidationErrorDB = (err: AppError) => {
  return new AppError(err.message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('Invalid token, please login again!', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('Invalid token, please login again', 401);
};

const handleErrors = function (err: AppError, req: Request, res: Response, next: NextFunction) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, req, res);
  }

  if (process.env.NODE_ENV === 'production') {
    // let error: AppError = { ...err };

    // MongoDB Errors can be handled (Mark them as Opertional)
    // Handle Invalid DB IDs
    if (err.name === 'CastError') err = handleCastErrorDB(err);

    // Handle Duplicate Keys
    if (err.code === 11000) err = handleDuplicateKeysDB(err);

    // Handle Validation Errors
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);

    // Handle Invalid JWT Signatures
    if (err.name === 'JsonWebTokenError') err = handleJsonWebTokenError();

    // Handle Expired JWT Tokens
    if (err.name === 'TokenExpiredError') err = handleTokenExpiredError();

    return sendErrorProd(err, req, res);
  }
};

export default handleErrors;
