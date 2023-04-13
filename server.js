const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: `${__dirname}/.env` });

console.log(app.get('env'));

//Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
