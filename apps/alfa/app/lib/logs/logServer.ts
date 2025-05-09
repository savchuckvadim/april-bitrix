import pino from 'pino';
import path from 'path';
import fs from 'fs';

export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || '/app/logs/server.log';

export type LogLevel = 'info' | 'warn' | 'error';

const logDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = pino(
  {
    level: 'info',
    formatters: {
      level(label) {
        return { level: label };
      },
      log(obj) {
        return obj; // сохраняем формат
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination(LOG_FILE_PATH)
);

// Совместимый интерфейс с твоим старым logServer
export function logServer(domain: string, userId: string, level: LogLevel, context: string, message: string) {
  logger[level]({ app: 'alfa', domain, userId, context, message });
}
