import { Request } from 'express';
import IUser from '../interfaces/user.interface';

declare module 'express' {
  interface Request {
    user?: IUser;
  }
}
