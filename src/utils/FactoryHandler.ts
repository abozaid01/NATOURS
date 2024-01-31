import { Model } from 'mongoose';
import { catchAsync } from './catchAsync';
import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';
import APIFeatures from './APIFeatures';

class Factory {
  static createOne<T>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response) => {
      const newDoc = await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          [Model.collection.collectionName.slice(0, -1)]: newDoc,
        },
      });
    });
  }

  static readOne<T>(Model: Model<T>, populateOptions?: { path: string; select?: string }) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const query = Model.findById(req.params.id).select('-__v');
      if (populateOptions) {
        query.populate(populateOptions);
      }
      const foundModel = await query;

      if (!foundModel) {
        return next(new AppError(`No ${Model.collection.collectionName.slice(0, -1)} found with this id`, 404));
      }

      res.json({
        status: 'success',
        data: {
          [Model.collection.collectionName.slice(0, -1)]: foundModel,
        },
      });
    });
  }

  static readAll<T>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response) => {
      // To allow nested GET Reviews on a Tours (hack)
      let filter = {};
      if (req.params.tour_id) {
        filter = { tour_id: req.params.tour_id };
      }
      // Base QUERY
      const query = Model.find(filter);

      // Add more Features for Query
      const features = new APIFeatures(query, req.query).filter().sort().project().paginate();

      // EXECUTE QUERY
      const docs = await features.queryExec;

      // SEND RESPONSE
      res.json({
        status: 'success',
        results: docs.length,
        data: {
          [Model.collection.collectionName]: docs,
        },
      });
    });
  }

  static updateOne<T>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return next(new AppError(`No ${Model.collection.collectionName.slice(0, -1)} found with this id`, 404));
      }

      res.json({
        status: 'success',
        data: {
          [Model.collection.collectionName.slice(0, -1)]: doc,
        },
      });
    });
  }

  static deleteOne<T>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const deletedModel = await Model.findOneAndDelete({ _id: req.params.id });

      if (!deletedModel) {
        return next(new AppError(`No ${Model.collection.collectionName.slice(0, -1)} found with this id`, 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    });
  }
}

export default Factory;
