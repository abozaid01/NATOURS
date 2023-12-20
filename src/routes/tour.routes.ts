import { Router } from 'express';
import * as toursController from '../controllers/tour.controllers';

const router = Router();

router
  .route('/top-5')
  .get(toursController.aliasTopTours, toursController.getTours);
router.route('/stats').get(toursController.getStats);
router.route('/busiest-month/:year').get(toursController.calculateBusiestMonth);
router
  .route('/')
  .get(toursController.getTours)
  .post(toursController.createTour);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

export default router;
