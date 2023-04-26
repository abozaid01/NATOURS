const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });
    newUser.password = undefined;
    newUser.passwordChangedAt = undefined;

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        user: { newUser },
        token,
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password is porvided by the user
    if (!email || !password)
        return next(
            new AppError(
                'please enter your email and password',
                400
            )
        );

    // 2) check if user exist && pasword is correct in the DB
    const user = await User.findOne({ email }).select(
        '+password'
    );

    if (
        !user ||
        !(await user.checkPassword(password, user.password))
    )
        return next(
            new AppError('email or password incorrect', 401)
        );

    // 3) if everything is okay, sent the jwt
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) check if the token is exist
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    )
        token = req.headers.authorization.split(' ')[1];

    if (!token)
        return next(
            new AppError(
                'You are not logged in, please login to access',
                401
            )
        );
    // 2) validate the token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );

    // 3)check if user still exists in DB - (not Deleted)
    const user = await User.findById(decoded.id);

    if (!user) {
        return next(
            new AppError(
                'The user belonged to this token is no longer exist',
                401
            )
        );
    }
    // 4) check if the user changed the password after the token was issued
    if (user.passwordChangedAfter(decoded.iat))
        return next(
            new AppError(
                'user recently changed password please login again!',
                401
            )
        );
    next();
});
