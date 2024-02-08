import mongoose from 'mongoose';

interface Tour {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: Date[];
  slug: string;
  secretTour: boolean;
  guides: mongoose.Schema.Types.ObjectId;
  locations: { description: string; type: 'Point'; day: number; region?: string; coordinates: number[] }[];
}

export default Tour;
