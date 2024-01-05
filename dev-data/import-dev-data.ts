import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import Tour from '../src/models/tour.models';

const data = JSON.parse(readFileSync(`${__dirname}/data/tours.json`, 'utf-8'));

(async function () {
  try {
    await mongoose.connect(process.env.ME_CONFIG_MONGODB_URL as string, {
      dbName: process.env.DB_NAME,
    });
    await Tour.deleteMany();
    await Tour.insertMany(data);
    process.exit();
  } catch (error) {
    console.error(error);
  }
})();
