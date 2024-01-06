import { Router } from 'express';
import * as usersController from '../controllers/user.controllers';
import * as authController from '../controllers/auth.controllers';

const router = Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forget-password').post(authController.forgetPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router.route('/update-password').patch(authController.authenticate, authController.updatePassword);

router.route('/update-me').patch(authController.authenticate, usersController.updateMe);
router.route('/delete-me').delete(authController.authenticate, usersController.deleteMe);

router.route('/').get(usersController.getUsers).post(usersController.createUser);
router.route('/:id').get(usersController.getUser).patch(usersController.updateUser).delete(usersController.deleteUser);

export default router;
