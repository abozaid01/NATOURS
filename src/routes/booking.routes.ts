import { Router } from 'express';
import * as bookingController from '../controllers/booking.controllers';
import * as authController from '../controllers/auth.controllers';

const router = Router();

router.use(authController.authenticate);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.authorize('admin'));

router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default router;
