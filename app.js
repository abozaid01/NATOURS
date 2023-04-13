const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const app = express();

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
);

//middlewares
app.use(express.json()); //console.log(req.body)  => JSON(application/json)
app.use(express.urlencoded({ extended: true })); //console.log(req.body)  => form-encode (name - value)
app.use(morgan('dev')); //3rd party middlewares
app.use((req, res, next) => {
    console.log('hello from my own middleware👋');
    next();
});

//helpers functions
const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: { tours },
    });
};

const getTour = (req, res) => {
    const id = req.params._id * 1; //string to number
    const tour = tours.find((el) => el._id === id);
    if (!tour)
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id',
        });

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
};

const createTour = (req, res) => {
    console.log(req.body);

    const newId = tours[tours.length - 1]._id + 1;

    const newTour = Object.assign({ _id: newId }, req.body); //merge 2 objs in one obj
    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/dev-data/data/tours.json`,
        JSON.stringify(tours),
        (err) => {
            if (err) {
                console.log(err);
                res.status(500).json('error!!');
            }
            res.status(201).json({
                status: 'success',
                data: { tour: newTour },
            });
        }
    );
};

const updateTour = (req, res) => {
    if (req.params._id * 1 > tours.length)
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id',
        });

    //Implement the logic of update ...
    res.status(200).json({
        status: 'success',
        data: '<updated tour ...>',
    });
};

const deleteTour = (req, res) => {
    if (req.params._id * 1 > tours.length)
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id',
        });

    //Implement the logic of delete ...
    res.status(204).json({
        status: 'success',
        data: null,
    });
};

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defiend',
    });
};
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defiend',
    });
};
const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defiend',
    });
};
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defiend',
    });
};
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defiend',
    });
};

//Routes
const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter
    .route('/:_id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter
    .route('/:_id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

const port = 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
