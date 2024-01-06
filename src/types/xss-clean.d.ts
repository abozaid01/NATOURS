declare module 'xss-clean' {
  import { RequestHandler } from 'express';

  interface XssCleanOptions {
    body?: boolean;
    params?: boolean;
    query?: boolean;
  }

  function xssClean(options?: XssCleanOptions): RequestHandler;

  export = xssClean;
}
