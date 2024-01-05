import express from 'express';
import tourRouter from './routes/tour.routes';
import userRouter from './routes/user.routes';
import AppError from './utils/AppError';
import handleErrors from './middlewares/error.middleware';
import httpLoggerMiddleware from './middlewares/logger.middleware';
const app = express();

// Middlewares
app.use(express.json());
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
