import { addDays, format, parseISO } from 'date-fns';
import {
    AI_ABSENCE_HORIZON_DAYS,
    AI_TARGET_LIMITS,
    aiToday,
    validateAiLevelRow,
    type AiManagerLevel,
    type AiTargetField,
} from '@/modules/entities/ai-analytics';
import type {
    AiAbsenceFormRow,
    AiSettingsFormState,
    AiSettingsTab,
    AiTargetFormRow,
} from './ai-settings-form.util';

/*
 * Валидация формы настроек по-русски — правила из описаний DTO и проверки
 * бэка: since и дата подтверждения не позже сегодня, цели в диапазонах,
 * отсутствия — from ≤ to, без пересечений у менеджера, не дальше 90 дней.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT = 'yyyy-MM-dd';

export interface AiSettingsFormErrors {
    levels: Map<number, string>;
    /** Ключ — aiTargetErrorKey(level, field). */
    targets: Map<string, string>;
    absences: Map<number, string>;
    roster: string | null;
}

export const aiTargetErrorKey = (
    level: AiManagerLevel,
    field: AiTargetField,
): string => `${level}.${field}`;

const validateNumber = (
    value: string,
    [min, max]: readonly [number, number],
    required: boolean,
): string | null => {
    if (value.trim() === '') return required ? 'Укажите число' : null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 'Укажите число';
    if (parsed < min || parsed > max) return `Число от ${min} до ${max}`;
    return null;
};

const TARGET_FIELDS: readonly [AiTargetField, boolean][] = [
    ['sales', false],
    ['presentationsMin', true],
    ['coldPerDay', true],
];

/** Ошибки полей строки целей: продажи необязательны (медиана), минимумы — нет. */
export const validateAiTargetRow = (
    row: AiTargetFormRow,
): Map<string, string> => {
    const errors = new Map<string, string>();
    for (const [field, required] of TARGET_FIELDS) {
        const error = validateNumber(
            row[field],
            AI_TARGET_LIMITS[field],
            required,
        );
        if (error) errors.set(aiTargetErrorKey(row.level, field), error);
    }
    return errors;
};

/** Горизонт отсутствий: сегодня + 90 дней (YYYY-MM-DD). */
export const aiAbsenceHorizon = (today: string): string =>
    format(addDays(parseISO(today), AI_ABSENCE_HORIZON_DAYS), DATE_FORMAT);

const isDateFilled = (row: AiAbsenceFormRow): boolean =>
    DATE_RE.test(row.from) && DATE_RE.test(row.to);

const validateAiAbsenceRow = (
    row: AiAbsenceFormRow,
    horizon: string,
): string | null => {
    if (!row.managerId) return 'Выберите менеджера';
    if (!isDateFilled(row)) return 'Даты в формате ГГГГ-ММ-ДД';
    if (row.from > row.to) return 'Конец не раньше начала';
    if (row.to > horizon) {
        return `Не дальше ${AI_ABSENCE_HORIZON_DAYS} дней вперёд (до ${horizon})`;
    }
    return null;
};

/** Отрезки одного менеджера не пересекаются (границы включительно). */
const overlapsOther = (
    row: AiAbsenceFormRow,
    rows: AiAbsenceFormRow[],
): boolean =>
    rows.some(
        other =>
            other.id !== row.id &&
            other.managerId === row.managerId &&
            isDateFilled(other) &&
            row.from <= other.to &&
            other.from <= row.to,
    );

export const validateAiAbsenceRows = (
    rows: AiAbsenceFormRow[],
    today: string,
): Map<number, string> => {
    const errors = new Map<number, string>();
    const horizon = aiAbsenceHorizon(today);
    for (const row of rows) {
        const error =
            validateAiAbsenceRow(row, horizon) ??
            (overlapsOther(row, rows)
                ? 'Пересекается с другим отсутствием менеджера'
                : null);
        if (error) errors.set(row.id, error);
    }
    return errors;
};

export const validateAiRoster = (
    value: string | null,
    today: string,
): string | null => {
    if (value === null || value === '') return null;
    if (!DATE_RE.test(value)) return 'Дата в формате ГГГГ-ММ-ДД';
    if (value > today) return 'Дата не позже сегодня';
    return null;
};

export const validateAiSettingsForm = (
    state: AiSettingsFormState,
    today: string = aiToday(),
): AiSettingsFormErrors => {
    const levels = new Map<number, string>();
    for (const row of state.levels) {
        const error = validateAiLevelRow(row, today);
        if (error) levels.set(row.managerId, error);
    }
    const targets = new Map<string, string>();
    for (const row of state.targets) {
        for (const [key, error] of validateAiTargetRow(row)) {
            targets.set(key, error);
        }
    }
    return {
        levels,
        targets,
        absences: validateAiAbsenceRows(state.absences, today),
        roster: validateAiRoster(state.roster, today),
    };
};

/** Вкладки с ошибками — пометка в шапке и блокировка «Сохранить». */
export const aiSettingsErrorTabs = (
    errors: AiSettingsFormErrors,
): AiSettingsTab[] => {
    const tabs: AiSettingsTab[] = [];
    if (errors.levels.size > 0) tabs.push('levels');
    if (errors.targets.size > 0) tabs.push('targets');
    if (errors.absences.size > 0) tabs.push('absences');
    if (errors.roster) tabs.push('roster');
    return tabs;
};
