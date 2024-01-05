class AppError extends Error {
  statusCode: number;
  status: string;
  isOpertional = true;
  // monogoose errors
  path?: string;
  value?: string;
  keyValue?: { name: string };
  code?: number;

  constructor(msg: string, statusCode: number) {
    super(msg);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
