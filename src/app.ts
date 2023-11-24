import express from 'express';
import tourRouter from './routes/tour.routes';
import userRouter from './routes/user.routes';

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
