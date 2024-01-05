import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tour.models';
import APIFeatures from '../utils/APIFeatures';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';

export const getTours = catchAsync(async (req: Request, res: Response) => {
  // Base QUERY
  const query = Tour.find();

  // Add more Features for Query
  const features = new APIFeatures(query, req.query).filter().sort().project().paginate();

  // EXECUTE QUERY
  const tours = await features.queryExec;

  // SEND RESPONSE
  res.json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

export const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
};

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const foundTour = await Tour.findById(req.params.id).select('-__v');

  if (!foundTour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.json({
    status: 'success',
    data: {
      tour: foundTour,
    },
  });
});

export const createTour = catchAsync(async (req: Request, res: Response) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

export const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

export const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
