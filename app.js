const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./util/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//404 Not found routes
app.all('*', (req, res, next) => {
    next(
        new AppError(
            `404 Not Found, can't find ${req.originalUrl} on this server`,
            404
        )
    );
});

//Experss Error Handle Middleware
app.use(globalErrorHandler);

module.exports = app;
