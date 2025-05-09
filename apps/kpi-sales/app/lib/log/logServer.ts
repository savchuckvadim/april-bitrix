// apps/kpi-sales/utils/logServer.ts
// import pino from 'pino';
// import fs from 'fs';
// import path from 'path';

// export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './app/logs/server.json';

// export type LogLevel = 'info' | 'warn' | 'error';

// interface LogEntry {
//   timestamp: string;
//   level: LogLevel;
//   context: string;
//   message: string;
// }

// export function logServer(level: LogLevel, context: string, message: string) {
//   const logEntry: LogEntry = {
//     timestamp: new Date().toISOString(),
//     level,
//     context,
//     message,
//   };

//   const logDir = path.dirname(LOG_FILE_PATH);
//   if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir, { recursive: true });
//   }

//   try {
//     fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(logEntry) + '\n');
//   } catch (error) {
//     console.error('Не удалось записать лог:', error);
//   }
// }

// apps/kpi-sales/utils/logServer.ts
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
export function logServer(level: LogLevel, context: string, message: string, domain?: string, userId?: string) {
  console.log('logServer', level, context, message, domain, userId);
  logger[level]({ app: 'kpi-sales', domain, userId, context, message });
}
