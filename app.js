const fs = require('fs');
const express = require('express');
const app = express();

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
);

//middlewares
app.use(express.json()); //console.log(req.body)  => JSON(application/json)
app.use(express.urlencoded({ extended: true })); //console.log(req.body)  => form-encode (name - value)

//============== Get All tours ==============
app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: { tours },
    });
});

//============== Get specific tour ==============
app.get('/api/v1/tours/:_id', (req, res) => {
    const id = req.params._id * 1; //string to number
    const tour = tours.find((el) => el._id === id);
    if (!tour)
        return res.status(404).json({ status: 'fail', message: 'invalid id' });

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
});

//============== Create new tour ==============
app.post('/api/v1/tours', (req, res) => {
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
});

//============== Edit specific tour ==============
//Put => edit enitre object
//patch => edit specific proprites
app.patch('/api/v1/tours/:id', (req, res) => {
    if (req.params._id * 1 > tours.length)
        return res.status(404).json({ status: 'fail', message: 'invalid id' });

    //Implement the logic of update ...
    res.status(200).json({
        status: 'success',
        data: '<updated tour ...>',
    });
});

//============== Delete specific tour ==============
app.delete('/api/v1/tours/:id', (req, res) => {
    if (req.params._id * 1 > tours.length)
        return res.status(404).json({ status: 'fail', message: 'invalid id' });

    //Implement the logic of delete ...
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
