const Tour = require('../models/tourModel');
const APIFaetures = require('../util/apiFeatures');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newTour,
    });
});

exports.aliasTopTours = catchAsync(
    async (req, res, next) => {
        req.query.limit = '5';
        req.query.sort =
            '-ratingAverage,summary,difficulty';
        req.query.fields =
            'name,price,ratingAverage,summary,difficulty';
        next();
    }
);

exports.getAllTours = catchAsync(async (req, res, next) => {
    // BUILD QUERY
    const features = new APIFaetures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate(Tour);

    //Execute query
    const tours = await features.query;

    //Send response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params._id);

    if (!tour)
        return next(
            new AppError('No tour found with this id', 404)
        );

    res.status(200).json({
        status: 'success',
        data: tour,
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
        req.params._id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!tour)
        return next(
            new AppError('No tour found with this id', 404)
        );

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
        req.params._id
    );

    if (!tour)
        return next(
            new AppError('No tour found with this id', 404)
        );

    res.status(204).json({
        status: 'success',
    });
});

exports.getTourStat = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                // _id: '$difficulty',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        {
            $match: { _id: { $ne: 'EASY' } },
        },
    ]);
    res.status(200).json({
        status: 'sucess',
        data: { stats },
    });
});

exports.getMonthlyPlan = catchAsync(
    async (req, res, next) => {
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStart: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $addFields: { month: '$_id' },
            },
            {
                $project: { _id: 0 },
            },
            {
                $sort: { numToursStart: -1 },
            },
            {
                $limit: 3,
            },
        ]);

        res.status(200).json({
            status: 'sucess',
            data: { plan },
        });
    }
);
