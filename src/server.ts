import app from './app';
import mongoose from 'mongoose';

mongoose
  .connect(process.env.ME_CONFIG_MONGODB_URL as string, {
    dbName: process.env.DB_NAME as string,
  })
  .then(() => {
    console.log('Connected to DB Successfully..');
  });

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default server;
