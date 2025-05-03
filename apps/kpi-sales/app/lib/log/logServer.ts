// apps/kpi-sales/utils/logServer.ts
import fs from 'fs';
import path from 'path';

export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './app/logs/server.json';

export type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
}

export function logServer(level: LogLevel, context: string, message: string) {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
  };

  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Не удалось записать лог:', error);
  }
}
