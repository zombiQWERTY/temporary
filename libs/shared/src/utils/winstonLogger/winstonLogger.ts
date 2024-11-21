import * as winston from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const rejectSystemLogs = winston.format((info) => {
  const rejectedContext = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
  ];

  return rejectedContext.includes(info.context) ? undefined : info;
});

export const makeLogger = (appName: string) => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(`ERPModul.${appName}`, {
            colors: false,
            prettyPrint: true,
          }),
          rejectSystemLogs(),
          winston.format.uncolorize(),
        ),
      }),
      new DailyRotateFile({
        filename: `logs/${appName}/%DATE%-combined.log`,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(`ERPModul.${appName}`, {
            colors: false,
            prettyPrint: true,
          }),
          rejectSystemLogs(),
        ),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '30d',
      }),
      new DailyRotateFile({
        filename: `logs/${appName}/%DATE%-error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(`ERPModul.${appName}`, {
            colors: false,
            prettyPrint: true,
          }),
          rejectSystemLogs(),
        ),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '30d',
      }),
    ],
  });
};
