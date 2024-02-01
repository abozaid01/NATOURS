import { Router } from 'express';
import * as toursController from '../controllers/tour.controllers';
import * as authController from '../controllers/auth.controllers';
import reviewRouter from './review.routes';

const router = Router();

router.use('/:tour_id/reviews', reviewRouter);

router
  .route('/')
  .get(toursController.getTours)
  .post(authController.authenticate, authController.authorize('admin', 'lead-guide'), toursController.createTour);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(authController.authenticate, authController.authorize('admin', 'lead-guide'), toursController.updateTour)
  .delete(authController.authenticate, authController.authorize('admin', 'lead-guide'), toursController.deleteTour);

router.route('/top-5').get(toursController.aliasTopTours, toursController.getTours);
router.route('/stats').get(toursController.getStats);
router.route('/busiest-month/:year').get(toursController.calculateBusiestMonth);
router.route('/tours-within/:distance/center/:latlang/unit/:unit').get(toursController.getToursWithin);
router.route('/distances/:latlang/unit/:unit').get(toursController.getDistances);

export default router;
