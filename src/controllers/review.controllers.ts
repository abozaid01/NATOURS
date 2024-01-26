import { Request as ExpressRequest, NextFunction, Response } from 'express';
import Review from '../models/review.models';
import IUser from '../interfaces/user.interface';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';

interface Request extends ExpressRequest {
  user?: IUser;
}

export const getReviews = catchAsync(async (req: Request, res: Response) => {
  // Get /reviews
  // Get /tours/2a3423afafa723fa/reviews
  let filter = {};

  if (req.params.tour_id) {
    filter = { tour_id: req.params.tour_id };
  }
  const reviews = await Review.find(filter).select('-__v');

  res.json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('You are not authenticated. Please log in to access this resource.', 401));

  // Allow Nested Routes
  if (!req.body.tour_id) req.body.tour_id = req.params.tour_id;
  if (!req.body.user_id) req.body.user_id = req.user.id;

  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user_id: req.body.user_id,
    tour_id: req.body.tour_id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      tour: newReview,
    },
  });
});
