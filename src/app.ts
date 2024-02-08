import express from 'express';
import tourRouter from './routes/tour.routes';
import userRouter from './routes/user.routes';
import reviewRouter from './routes/review.routes';
import viewsRouter from './routes/view.routes';
import AppError from './utils/AppError';
import handleErrors from './middlewares/error.middleware';
import httpLoggerMiddleware from './middlewares/logger.middleware';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.static(`${__dirname}/public`));

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

// Middlewares
// Use Helmet middleware to Set security HTTP headers and configure CSP
app.use(helmet());
const scriptSrcUrls = ['https://api.tiles.mapbox.com/', 'https://api.mapbox.com/'];
const styleSrcUrls = ['https://api.mapbox.com/', 'https://api.tiles.mapbox.com/', 'https://fonts.googleapis.com'];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = ['fonts.gstatic.com'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", "'unsafe-inline'", ...fontSrcUrls],
    },
  }),
);

// Limit requests from same IP
const limiter = rateLimit({
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many Requests from this IP, please try again in an hour!',
});
app.use(limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

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
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//404 Not-Found Routes
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handling Middleware
app.use(handleErrors);

export default app;
