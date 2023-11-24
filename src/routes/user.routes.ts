import { Router } from 'express';
import * as usersController from '../controllers/user.controllers';

const router = Router();

router
  .route('/')
  .get(usersController.getUsers)
  .post(usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

export default router;
