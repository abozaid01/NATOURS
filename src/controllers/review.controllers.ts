import { Request as ExpressRequest, NextFunction, Response } from 'express';
import Review from '../models/review.models';
import IUser from '../interfaces/user.interface';
import AppError from '../utils/AppError';
import * as factory from '../utils/handleFactory';

interface Request extends ExpressRequest {
  user?: IUser;
}

export const getReviews = factory.readAll(Review);
export const getReview = factory.readOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);

export const setTourReviewIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('You are not authenticated. Please log in to access this resource.', 401));

  // Allow Nested Routes
  if (!req.body.tour_id) req.body.tour_id = req.params.tour_id;
  if (!req.body.user_id) req.body.user_id = req.user.id;
  next();
};
