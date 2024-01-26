import { Router } from 'express';
import * as reviewsController from '../controllers/review.controllers';
import * as authController from '../controllers/auth.controllers';

const router = Router({ mergeParams: true });

// thanks to mergeParams, I can handle these routes ...

// Get /reviews
// Get /tours/2a3423afafa723fa/reviews
// POST /tours/2a3423afafa723fa/reviews
// POST /reviews

router
  .route('/')
  .get(reviewsController.getReviews)
  .post(authController.authenticate, authController.authorize('user'), reviewsController.createReview);

export default router;
