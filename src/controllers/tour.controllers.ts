import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tour.models';
import { catchAsync } from '../utils/catchAsync';
import * as factory from '../utils/handleFactory';

export const getTours = factory.readAll(Tour);
export const getTour = factory.readOne(Tour, { path: 'reviews', select: '-__v' });
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour);
export const deleteTour = factory.deleteOne(Tour);

export const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
};

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Tour.aggregate([
    // {
    //   $match: { ratingsAverage: { $gte: 4.7 } },
    // },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// Calculate the busiest month of a given year (how many tours start in each month of the given year )
export const calculateBusiestMonth = catchAsync(async (req: Request, res: Response) => {
  const year: number = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: plan,
  });
});
