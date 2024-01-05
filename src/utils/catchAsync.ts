import { Request, Response, NextFunction } from 'express';

export const catchAsync = function (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  // return an anonyomous function that will call fn() later
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
