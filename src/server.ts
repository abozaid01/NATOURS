import app from './app';
import mongoose from 'mongoose';
import { logger } from './utils/logger';

process.on('uncaughtException', (err: Error) => {
  logger?.warn('UNHANDLED EXECPTION!', 'shutting down ...');
  logger?.error(err.name);
  logger?.error(err.message);

  process.exit(1);
});

mongoose
  .connect(process.env.ME_CONFIG_MONGODB_URL as string, {
    dbName: process.env.DB_NAME as string,
  })
  .then(() => {
    logger?.info('Connected to DB Successfully..');
  });

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  logger?.info(`Server is running at http://localhost:${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  logger?.warn('UNHANDLED REJECTION!, shutting down ...');
  logger?.error(err.name);
  logger?.error(err.message);
  server.close(() => {
    process.exit(1); // 1 means uncaught execption, 0 means success
  });
});
export default server;
