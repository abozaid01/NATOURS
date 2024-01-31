import { Schema, model, Query } from 'mongoose';
import IReview from '../interfaces/review.interface';
import Tour from './tour.models';
import { logger } from '../utils/logger';

const reviewSchema = new Schema<IReview>({
  review: {
    type: String,
    required: [true, "Review can't be empty"],
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // Parent Referncing
  user_id: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must be belong to a user'],
  },
  tour_id: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must be belong to a tour'],
  },
});

// ================== Query Middlewares ===============
reviewSchema.pre<Query<IReview[], IReview>>(/^find/, function (next) {
  this.populate({ path: 'user_id', select: 'name photo' }); //.populate({ path: 'tour_id', select: 'name' });
  next();
});

// NOTE: findByIdAnd is shorthand for <=> findOneAnd
reviewSchema.post<Query<IReview[], IReview>>(/findOneAnd/, function (doc) {
  if (doc) {
    (doc.constructor as unknown as IReview).calcAvgRatings((doc as unknown as IReview).tour_id);
  }
});

// ================== Static Methods on the Model ===============
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  // This points to the Model
  try {
    const stats = await this.aggregate([
      {
        $match: { tour_id: tourId },
      },
      {
        $group: { _id: '$tour_id', nRating: { $sum: 1 }, avgRatings: { $avg: '$rating' } },
      },
    ]);

    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, { ratingsAverage: stats[0].avgRatings, ratingsQuantity: stats[0].nRating });
    } else {
      await Tour.findByIdAndUpdate(tourId, { ratingsAverage: 4.5, ratingsQuantity: 0 });
    }
  } catch (error) {
    logger?.error(error);
  }
};

// =================== Documents Middelwares ===================
reviewSchema.post('save', function () {
  // this points to current review Document, this.constructor points to Review Model (Review.calcAvgRatings)
  (this.constructor as unknown as IReview).calcAvgRatings(this.tour_id);
});

// Unique compound inde, Ensure that each user make ONLY one review for one tour
reviewSchema.index({ tour_id: 1, user_id: 1 }, { unique: true });

const Review = model<IReview>('Review', reviewSchema);

export default Review;
