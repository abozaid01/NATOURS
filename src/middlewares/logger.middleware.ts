import { Request, Response, NextFunction } from 'express';
import { httpLogger } from '../utils/logger';

const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'];
  const start = new Date();

  res.on('finish', () => {
    const end = new Date();
    const responseTime = end.getTime() - start.getTime();
    httpLogger?.info({
      timestamp: new Date(),
      level: 'info',
      message: `Received ${method} request on ${originalUrl}`,
      method,
      url: originalUrl,
      status: res.statusCode,
      responseTime,
      IP: ip,
      userAgent,
    });
  });

  next();
};

export default httpLoggerMiddleware;
