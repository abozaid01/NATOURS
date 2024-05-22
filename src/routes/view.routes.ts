import { Router } from 'express';
import viewsController from '../controllers/view.controllers';
import * as authController from '../controllers/auth.controllers';

const router = Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.authenticate, viewsController.getAccount);
router.get('/my-tours', authController.authenticate, viewsController.getMyTours);

export default router;
