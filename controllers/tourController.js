const Tour = require('../models/tourModel');
const APIFaetures = require('../util/apiFeatures');

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({req.body});
        // newTour.save();

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: newTour,
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,summary,difficulty';
    req.query.fields =
        'name,price,ratingAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        const features = new APIFaetures(
            Tour.find(),
            req.query
        )
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
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params._id);

        res.status(200).json({
            status: 'success',
            data: tour,
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params._id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            status: 'success',
            data: { tour },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params._id);

        res.status(204).json({
            status: 'success',
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.getTourStat = async (req, res) => {
    try {
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
                $match: { _id: { $ne: 'easy' } },
            },
        ]);
        res.status(200).json({
            status: 'sucess',
            data: { stats },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
