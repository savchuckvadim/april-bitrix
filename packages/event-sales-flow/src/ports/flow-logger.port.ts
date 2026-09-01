/**
 * FlowLogger — шов логирования пакета.
 *
 * Сервисы флоу не знают, куда пишут: на бэке это @nestjs Logger, в браузере —
 * console (готовая реализация: AppLogger из ../shared/lib/logger). Состав
 * методов минимален намеренно — {log, warn, error}, как договорено планом.
 */
export interface FlowLogger {
    log(message: unknown, ...optionalParams: unknown[]): void;
    warn(message: unknown, ...optionalParams: unknown[]): void;
    error(message: unknown, ...optionalParams: unknown[]): void;
}

/** Фабрика логгера с контекстом (имя сервиса) — как `new Logger(Ctx.name)` на бэке. */
export type FlowLoggerFactory = (context: string) => FlowLogger;
