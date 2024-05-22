import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import Tour from '../models/tour.models';
import AppError from '../utils/AppError';
import Stripe from 'stripe';
import Booking from '../models/booking.models';
import Factory from '../utils/FactoryHandler';
import { logger } from '../utils/logger';
import User from '../models/user.models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const getCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('You are not authenticated. Please log in to access this resource.', 401));

  // 1) Get the Currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('No tour found', 404));

  // 2) Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour?.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) redirect the user to the checkout page
  res.redirect(303, `${session.url}`);
});

export const webhookCheckout = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await createBookingCheckout(event.data.object);
      break;
    // ... handle other event types
    default:
      logger?.info(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ recived: true });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createBookingCheckout = async (session: any) => {
  const tour_id = session.client_reference_id;
  const user_id = (await User.findOne({ email: session.customer_email }))?.id;
  const price = session.amount_total / 100;

  if (!tour_id && !user_id && !price) return;

  await Booking.create({ tour_id, user_id, price });
};

export const createBooking = Factory.createOne(Booking);
export const getOneBooking = Factory.readOne(Booking);
export const getAllBookings = Factory.readAll(Booking);
export const updateBooking = Factory.updateOne(Booking);
export const deleteBooking = Factory.deleteOne(Booking);
