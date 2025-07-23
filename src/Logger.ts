import winston from "winston";
import { format } from "logform";

class Logger {
  private constructor() {}
  public static getInstance(): winston.Logger {
    return winston.createLogger({
      level: "verbose",
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.printf(
          (info) =>
            `${info.timestamp}\t[${info.scope ?? ""}]\t${info.level}:\t${info.message}`,
        ),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: process.env.LOG_FILE_PATH ?? "logs.log",
        }),
      ],
    });
  }
}

export default Logger;
