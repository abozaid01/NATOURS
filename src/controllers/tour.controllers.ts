import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tour.models';
import { catchAsync } from '../utils/catchAsync';
import Factory from '../utils/FactoryHandler';
import AppError from '../utils/AppError';

export const getTours = Factory.readAll(Tour);
export const getTour = Factory.readOne(Tour, { path: 'reviews', select: '-__v' });
export const createTour = Factory.createOne(Tour);
export const updateTour = Factory.updateOne(Tour);
export const deleteTour = Factory.deleteOne(Tour);

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

// Get all tours within a certain distance from user's location
export const getToursWithin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { distance, latlang, unit } = req.params;

  const radius = unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1;

  const [lat, lang] = latlang.split(',').map(Number);
  if (!lat || !lang) {
    return next(new AppError(`Please Provide lattiude and longitude in format lat,lang`, 400));
  }

  const tours = await Tour.aggregate([
    {
      $unwind: '$locations',
    },
    {
      $project: { locations: 1, name: 1 },
    },
    {
      $match: { 'locations.day': 1 },
    },
    {
      $match: { locations: { $geoWithin: { $centerSphere: [[lang, lat], radius] } } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

// Caluclate all distances to tours from user's location
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlang, unit } = req.params;
  const [lat, lang] = latlang.split(',').map(Number);

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lang) {
    next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lang, lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
