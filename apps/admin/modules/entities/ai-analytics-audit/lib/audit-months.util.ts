import {
    AI_ANALYTICS_AUDIT_RUN_DEFAULTS,
    AI_ANALYTICS_GOLDEN_SET_DEFAULTS,
    AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS,
} from '../model';

/** Целое в границах [min, max] — как валидирует бэк (@IsInt + @Min/@Max). */
const isIntegerInRange = (value: number, min: number, max: number): boolean =>
    Number.isInteger(value) && value >= min && value <= max;

/** Окно аудита: целое 1–24. */
export const isValidAuditMonths = (value: number): boolean =>
    isIntegerInRange(
        value,
        AI_ANALYTICS_AUDIT_RUN_DEFAULTS.minMonths,
        AI_ANALYTICS_AUDIT_RUN_DEFAULTS.maxMonths,
    );

/** Окно пробы истории стадий: целое 1–36. */
export const isValidProbeMonths = (value: number): boolean =>
    isIntegerInRange(
        value,
        AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS.minMonths,
        AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS.maxMonths,
    );

/** Квота пар test-retest: целое 10–1000. */
export const isValidGoldenQuota = (value: number): boolean =>
    isIntegerInRange(
        value,
        AI_ANALYTICS_GOLDEN_SET_DEFAULTS.minQuota,
        AI_ANALYTICS_GOLDEN_SET_DEFAULTS.maxQuota,
    );

/**
 * Значение поля → число месяцев. Пустая строка и не-число дают NaN:
 * поле подсвечивается, а запуск блокируется — молча подставлять дефолт
 * нельзя, владелец должен видеть, с каким окном считает.
 */
export const parseAuditMonths = (raw: string): number =>
    raw.trim() === '' ? Number.NaN : Number(raw);
