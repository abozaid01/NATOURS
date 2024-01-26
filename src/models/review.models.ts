import { Schema, model, Query } from 'mongoose';
import IReview from '../interfaces/review.interface';

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

reviewSchema.pre<Query<IReview[], IReview>>(/^find/, function (next) {
  this.populate({ path: 'user_id', select: 'name photo' }); //.populate({ path: 'tour_id', select: 'name' });
  next();
});

const Review = model<IReview>('Review', reviewSchema);

export default Review;
