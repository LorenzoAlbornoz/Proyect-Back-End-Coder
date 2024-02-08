import winston from "winston";
import config from "../config.js";
import { __dirname } from "../utils.js";

// Define el sistema de niveles
const levels = {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
  };

const prodLogger = winston.createLogger({
    levels: levels,
    transports: [
      new winston.transports.Console({ level: 'info' }),
      new winston.transports.File({ level: 'error', filename: `${__dirname}/logs/errors.log` }),
    ],
  });
  
  const devLogger = winston.createLogger({
    levels: levels,
    transports: [new winston.transports.Console({ level: 'debug' })],
  });

const addLogger = (req, res, next) => {
    req.logger = config.MODE === "devel" ? devLogger : prodLogger;
    req.logger.http(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next()
}

export default addLogger;