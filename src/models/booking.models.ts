import { Schema, model, Query } from 'mongoose';
import IBooking from '../interfaces/booking.interface';

const bookingSchema = new Schema<IBooking>({
  tour_id: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },
  user_id: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must belong to a price'],
  },
  paid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre<Query<IBooking[], IBooking>>(/^find/, function (next) {
  this.populate({ path: 'user_id' }).populate({ path: 'tour_id', select: 'name' });
  next();
});

const Booking = model('Bookings', bookingSchema);

export default Booking;
