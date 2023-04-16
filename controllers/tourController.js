const Tour = require('../models/tourModel');

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
        // 1.0) Filtering
        const queryObj = { ...req.query };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
        ];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1.1) Advanced Filtering localhost:3000/api/v1/tours?duration[gte]=5
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lte)\b/g,
            (match) => `$${match}`
        );

        let query = Tour.find(JSON.parse(queryStr));

        // 2) Sorting                              http://localhost:3000/api/v1/tours?sort=price,-duration
        if (req.query.sort) {
            const sortBy = req.query.sort
                .split(',')
                .join(' ');
            query = query.sort(sortBy);
        } else query = query.sort('-createdAt'); //DEFAULT sort by newly created

        // 3) Field Limiting                   http://localhost:3000/api/v1/tours?fields=name,price
        if (req.query.fields) {
            const fields = req.query.fields
                .split(',')
                .join(' ');

            query.select(fields);
        } else query.select('-__v'); //DEFAULT - remove __v

        // 4) Pagination                    http://localhost:3000/api/v1/tours?page=2&limit=100   page1=> 1-100 page2=> 101-200 page3=> 201-300
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours)
                throw new Error("this page doesn't exist");
        }
        //Execute query
        const tours = await query;

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
