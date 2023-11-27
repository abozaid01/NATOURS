import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tour.models';
import APIFeatures from '../utils/apiFeatures';

export const getTours = async (req: Request, res: Response) => {
  try {
    // Base QUERY
    const query = Tour.find();

    // Add more Features for Query
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .project()
      .paginate();

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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
};

export const getTour = async (req: Request, res: Response) => {
  try {
    const foundTour = await Tour.findById(req.params.id).select('-__v');
    res.json({
      status: 'success',
      data: {
        tour: foundTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
