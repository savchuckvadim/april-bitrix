/**
 * ConsoleFlowLogger — браузерная реализация порта FlowLogger.
 *
 * Пишет в console с префиксом контекста (имя сервиса) — ровно как AppLogger
 * пакета, которым зеркала уже заменяют @nestjs Logger; наследование вместо
 * дублирования: один формат префикса на весь пакет.
 */
import { AppLogger } from '../../shared/lib/logger';
import type { FlowLogger, FlowLoggerFactory } from '../../ports/flow-logger.port';

export class ConsoleFlowLogger extends AppLogger implements FlowLogger {}

/** Фабрика для мест, ждущих FlowLoggerFactory (как `new Logger(Ctx.name)`). */
export const createConsoleFlowLogger: FlowLoggerFactory = (context: string) =>
    new ConsoleFlowLogger(context);
