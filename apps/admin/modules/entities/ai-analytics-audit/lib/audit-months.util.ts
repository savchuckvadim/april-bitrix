import { AI_ANALYTICS_AUDIT_RUN_DEFAULTS } from '../model';

/** Целое в границах 1–24 — как валидирует бэк. */
export const isValidAuditMonths = (value: number): boolean =>
    Number.isInteger(value) &&
    value >= AI_ANALYTICS_AUDIT_RUN_DEFAULTS.minMonths &&
    value <= AI_ANALYTICS_AUDIT_RUN_DEFAULTS.maxMonths;

/**
 * Значение поля → число месяцев. Пустая строка и не-число дают NaN:
 * поле подсвечивается, а запуск блокируется — молча подставлять дефолт
 * нельзя, владелец должен видеть, с каким окном считает.
 */
export const parseAuditMonths = (raw: string): number =>
    raw.trim() === '' ? Number.NaN : Number(raw);
