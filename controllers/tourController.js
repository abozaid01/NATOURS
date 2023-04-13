const fs = require('fs');
const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../dev-data/data/tours.json`
    )
);

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: { tours },
    });
};

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
    console.log(req.body);

    const newId = tours[tours.length - 1]._id + 1;

    const newTour = Object.assign({ _id: newId }, req.body); //merge 2 objs in one obj
    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/../dev-data/data/tours.json`,
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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
