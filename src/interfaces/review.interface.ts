import mongoose from 'mongoose';

interface Review {
  review: string;
  rating: number;
  tour_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  calcAvgRatings(tour_id: mongoose.Schema.Types.ObjectId): void;
}

export default Review;
