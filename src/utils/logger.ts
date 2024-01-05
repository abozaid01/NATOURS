import winston, { createLogger, format, transports } from 'winston';

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'hh:mm:ss' }),
  format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack ? stack : ''}`;
  }),
);

const devLogger = function () {
  return createLogger({
    level: 'debug',
    format: format.combine(devFormat),
    transports: [new transports.Console()],
  });
};

// combined.log (info, error, warn)
const prodCombinedFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message, stack }) => {
    const sanitizedStack = stack ? stack.replace(/(\r\n|\n|\r)/gm, ' ') : '';

    return `{"timestamp":"${timestamp}", "level":"${level}", "message":"${message}"${
      sanitizedStack ? ', "stack":' + '"' + sanitizedStack + '"' + '}' : '}'
    }`;
  }),
);

const prodLogger = function () {
  return createLogger({
    level: 'info',
    format: prodCombinedFormat,
    transports: [
      new transports.File({
        filename: 'logs/combined.log',
      }),
    ],
    // defaultMeta: { service: 'user-service' },
  });
};

const prodHttpFormat = format.combine(
  format.timestamp(),
  format.json({ space: 2 }),
  format.printf(({ timestamp, level, message, method, url, status, responseTime, IP, userAgent }) => {
    const logObject = {
      timestamp,
      level,
      message,
      method,
      url,
      status,
      responseTime,
      IP,
      userAgent,
    };

    // if (error) {
    //   logObject.error = error;
    //   logObject.stack = stack;
    // }

    return JSON.stringify(logObject);
  }),
);

const prodHttpLogger = function () {
  return createLogger({
    level: 'info',
    format: prodHttpFormat,
    transports: [
      new transports.File({
        filename: 'logs/requests.log',
      }),
    ],
  });
};

let logger: winston.Logger | null = null;
let httpLogger: winston.Logger | null = null;

if (process.env.NODE_ENV === 'development') {
  logger = devLogger();
}

if (process.env.NODE_ENV === 'production') {
  logger = prodLogger();
  httpLogger = prodHttpLogger();
}

export { logger, httpLogger };
