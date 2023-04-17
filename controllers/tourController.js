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
