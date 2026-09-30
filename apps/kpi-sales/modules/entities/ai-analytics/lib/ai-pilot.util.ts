import type { AiCallReportStatus } from '../model';

/**
 * Пилот разбора звонков: список действует, только когда разбор включён и
 * ограничен непустым списком сотрудников (пустой список = разбираются все).
 * Один источник для чек-листа «Готовность витрины», подписей и пустых
 * состояний; сам состав строк вкладки режет бэк.
 */
export const aiPilotIds = (report: AiCallReportStatus | undefined): string[] =>
    report?.enabled && report.pilotUserIds?.length ? report.pilotUserIds : [];
