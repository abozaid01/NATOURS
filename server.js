const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/.env` });

const app = require('./app');
console.log(app.get('env'));

//Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
