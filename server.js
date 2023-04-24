process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log(
        'UNHANDLED EXECPTION!',
        'shutting down ...'
    );

    process.exit(1);
});

const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/.env` });

const mongoose = require('mongoose');
const app = require('./app');

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
    });

//Starting the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log(
        'UNHANDLED REJECTION!',
        'shutting down ...'
    );
    server.close(() => {
        process.exit(1);
    });
});
