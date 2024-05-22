import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import Tour from '../models/tour.models';
import AppError from '../utils/AppError';
import Booking from '../models/booking.models';

class ViewsController {
  static getOverview = catchAsync(async (req: Request, res: Response) => {
    const tours = await Tour.find();
    res.status(200).render('overview', { title: 'All tours', tours });
  });

  static getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug }).populate({ path: 'reviews', select: 'review rating user_id' });

    if (!tour) return next(new AppError('Tour not found', 404));
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  });

  static getLoginForm = (req: Request, res: Response) => {
    res.status(200).render('login', { title: 'Log into your account' });
  };

  static getAccount = (req: Request, res: Response) => {
    res.status(200).render('account', {
      title: 'Your account',
    });
  };

  static getMyTours = catchAsync(async (req: Request, res: Response) => {
    const bookings = await Booking.find({ user_id: req.user!.id });
    const tourIds = bookings.map((el) => el.tour_id);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview', {
      title: 'Your account',
      tours,
    });
  });
}

export default ViewsController;
