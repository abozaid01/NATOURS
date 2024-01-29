import { Router } from 'express';
import * as usersController from '../controllers/user.controllers';
import * as authController from '../controllers/auth.controllers';

const router = Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forget-password').post(authController.forgetPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router.route('/update-password').patch(authController.authenticate, authController.updatePassword);

// Protect all routes after this Middelware
router.use(authController.authenticate);

router
  .route('/me')
  .get(usersController.getMe, usersController.getUser)
  .patch(usersController.updateMe)
  .delete(usersController.deleteMe);

router.use(authController.authorize('admin'));

router.route('/').get(usersController.getUsers).post(usersController.createUser);
router.route('/:id').get(usersController.getUser).patch(usersController.updateUser).delete(usersController.deleteUser);

export default router;
