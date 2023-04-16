const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: `${__dirname}/../../.env` });
const connString = process.env.DATABASE;

mongoose.set('useFindAndModify', false);
mongoose
    .connect(connString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log('connected to DB sucessfully ...');
    })
    .catch((err) => console.log('ERROR!!!', err));

//Delte All Data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    } catch (error) {
        console.log('Erorr while Deleting Data!!', error);
    }
    process.exit();
};

//Read JSON file
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf8')
);

//Import data to DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    } catch (error) {
        console.log('Erorr while importing Data!!', error);
    }
    process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
