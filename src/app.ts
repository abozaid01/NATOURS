import express from 'express';
import tourRouter from './routes/tour.routes';
import userRouter from './routes/user.routes';
import AppError from './utils/AppError';
import handleErrors from './middlewares/error.middleware';
import httpLoggerMiddleware from './middlewares/logger.middleware';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

const app = express();

// Middlewares
// Set security HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many Requests from this IP, please try again in an hour!',
});
app.use(limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS, make sure this comes before any routes
app.use(xss());

// Prevent parameter pollution by removing duplicate query strings. NOTE: it will accept the last query of the duplicate ones
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'], // allowed query stings to be duplicated
  }),
);

// Logger
app.use(httpLoggerMiddleware);

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//404 Not-Found Routes
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handling Middleware
app.use(handleErrors);

export default app;
