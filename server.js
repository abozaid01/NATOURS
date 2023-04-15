const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/.env` });

const mongosse = require('mongoose');
const app = require('./app');

const connString = process.env.DATABASE;
mongosse
    .connect(connString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log('connected to DB sucessfully ...');
    })
    .catch((err) => console.log('ERROR!!!', err));

const tourSchema = new mongosse.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    rating: { type: Number, default: 4.5 },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
});

const Tour = mongosse.model('Tour', tourSchema);

const tour = new Tour({
    name: 'The Forest Hiker',
    price: 300,
    rating: 4.8,
});

tour.save()
    .then((doc) => {
        console.log(doc);
    })
    .catch((err) => {
        console.log('ERROR!', err);
    });

//Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
