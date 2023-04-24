const AppError = require('../util/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    //Opertional, trusted Errors : send to client
    if (err.isOpertional)
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    //Programming or other Unkown Errors: Don't leak error details
    else {
        console.error('ERORR!! 💥', err);

        res.status(500).json({
            status: 'error',
            message: 'somthing went wrog!',
        });
    }
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicataeFieldsDB = (err) => {
    const message = `Duplicate field value: ${err.keyValue.name}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(
        (el) => el.message
    );

    const message = `Invalid input data. ${errors.join(
        '. '
    )}`;
    return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }

    if (process.env.NODE_ENV === 'production ') {
        let error = { ...err };

        if (err.name === 'CastError')
            error = handleCastErrorDB(error);

        if (err.code === 11000)
            error = handleDuplicataeFieldsDB(error);

        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
};
