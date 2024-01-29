import { Router } from 'express';
import * as toursController from '../controllers/tour.controllers';
import * as authController from '../controllers/auth.controllers';
import reviewRouter from './review.routes';

const router = Router();

router.use('/:tour_id/reviews', reviewRouter);

router.route('/top-5').get(toursController.aliasTopTours, toursController.getTours);
router.route('/stats').get(toursController.getStats);
router.route('/busiest-month/:year').get(toursController.calculateBusiestMonth);
router.route('/').get(authController.authenticate, toursController.getTours).post(toursController.createTour);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(authController.authenticate, authController.authorize('admin', 'lead-guide'), toursController.deleteTour);

export default router;
