import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import Tour from '../src/models/tour.models';
import User from '../src/models/user.models';
import Review from '../src/models/review.models';

const toursData = JSON.parse(readFileSync(`${__dirname}/data/tours.json`, 'utf-8'));
const usersData = JSON.parse(readFileSync(`${__dirname}/data/users.json`, 'utf-8'));
const reviewsData = JSON.parse(readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'));

(async function () {
  try {
    await mongoose.connect(process.env.ME_CONFIG_MONGODB_URL as string, {
      dbName: process.env.DB_NAME,
    });
    await Tour.deleteMany();
    await Tour.insertMany(toursData);

    await Review.deleteMany();
    await Review.insertMany(reviewsData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usersData.forEach(async (userData: any) => {
      const user = new User(userData);
      await user.save({ validateBeforeSave: false });
    });

    process.exit();
  } catch (error) {
    console.error(error);
  }
})();
