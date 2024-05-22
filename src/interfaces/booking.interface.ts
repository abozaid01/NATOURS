import mongoose from 'mongoose';

interface Booking {
  user_id: mongoose.Types.ObjectId;
  tour_id: mongoose.Types.ObjectId;
  price: number;
  paid: boolean;
  createdAt: Date;
}

export default Booking;
