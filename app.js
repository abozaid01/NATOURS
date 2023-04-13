const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const express = require('express');
const app = express();

//middlewares
app.use(express.json()); //console.log(req.body)  => JSON(application/json)
app.use(express.urlencoded({ extended: true })); //console.log(req.body)  => form-encode (name - value)
app.use(morgan('dev')); //3rd party middlewares
app.use((req, res, next) => {
    console.log('hello from my own middleware👋');
    next();
});

//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
