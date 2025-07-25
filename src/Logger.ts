import winston from "winston";
import { format } from "logform";
import ConfigFacade from "./ConfigFacade";
import { WinstonLogger } from "./interfaces";

class Logger {
  private constructor() {}
  public static getInstance(): WinstonLogger {
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
          filename: ConfigFacade.getConfig()?.logFilePath,
        }),
      ],
    });
  }
}

export default Logger;
