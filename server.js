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
    })
    .catch((err) => console.log('ERROR!!!', err));

//Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
