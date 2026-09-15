import type {
    AiManagerLevel,
    AiManagerLevelInput,
    AiManagerRow,
} from '../model';
import { aiToday } from './ai-period.util';

/** Строка формы уровней: по менеджеру обзора. */
export interface AiLevelFormRow {
    managerId: number;
    level: AiManagerLevel;
    /** Дата начала стажа YYYY-MM-DD; пусто — не менять. */
    since: string;
    /** Уровень назначен вручную (иначе — дефолт по стажу). */
    manual: boolean;
    tenureMonths: number | null;
}

/** Форма из строк обзора: текущий уровень и источник, since не известен. */
export const buildAiLevelsForm = (rows: AiManagerRow[]): AiLevelFormRow[] =>
    rows.map(row => ({
        managerId: Number(row.managerId),
        level: row.level,
        since: '',
        manual: row.levelSource === 'manual',
        tenureMonths: row.tenureMonths,
    }));

/** Ошибка валидации строки (since не позже сегодня); null — ок. */
export const validateAiLevelRow = (
    row: AiLevelFormRow,
    today: string = aiToday(),
): string | null => {
    if (!row.since) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.since))
        return 'Дата в формате ГГГГ-ММ-ДД';
    if (row.since > today) return 'Дата не позже сегодня';
    return null;
};

/** Полезная нагрузка settings/save: полный список, since только заданный. */
export const toAiLevelsPayload = (
    rows: AiLevelFormRow[],
): AiManagerLevelInput[] =>
    rows.map(row => ({
        managerId: row.managerId,
        level: row.level,
        ...(row.since ? { since: row.since } : {}),
    }));

/** Гард значения селекта уровня. */
export const isAiManagerLevel = (value: unknown): value is AiManagerLevel =>
    value === 'junior' || value === 'middle' || value === 'senior';

/** Стаж человеком: 7 → «7 мес.», null → «стаж не задан». */
export const formatAiTenure = (months: number | null): string =>
    months === null ? 'стаж не задан' : `${months} мес.`;
