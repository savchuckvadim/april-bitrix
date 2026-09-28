import type {
    AiAbsenceKind,
    AiLevelTargetInput,
    AiManagerLevel,
    AiManagerLevelInput,
    AiManagerRow,
    AiSettingsBlockName,
} from '../model';
import { aiToday } from './ai-period.util';

/*
 * Форма уровней ↔ payload settings/save и справочники остальных блоков
 * настроек (виды отсутствий, диапазоны целей, подписи блоков, коды
 * breaksSeries). Логика самой формы настроек — в виджете
 * (widgets/ai-analytics-report/lib/ai-settings-form.util.ts).
 */

/** Строка формы уровней: по менеджеру обзора. */
export interface AiLevelFormRow {
    managerId: number;
    level: AiManagerLevel;
    /**
     * Дата начала стажа YYYY-MM-DD; пусто — не менять: без ручной даты
     * стаж берётся из дат Bitrix (дата приёма → регистрация → первое
     * событие), дату задают только чтобы поправить их.
     */
    since: string;
    /** Уровень назначен вручную (иначе — по стажу из Bitrix или по умолчанию). */
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

/* ---------- Отсутствия ---------- */

/** Подписи видов отсутствия (kind DTO). */
export const AI_ABSENCE_KIND_LABELS: Record<AiAbsenceKind, string> = {
    vacation: 'Отпуск',
    sick: 'Больничный',
    training: 'Обучение',
    other: 'Другое',
};

/** Опции селекта вида отсутствия. */
export const AI_ABSENCE_KIND_OPTIONS: {
    value: AiAbsenceKind;
    label: string;
}[] = (Object.keys(AI_ABSENCE_KIND_LABELS) as AiAbsenceKind[]).map(value => ({
    value,
    label: AI_ABSENCE_KIND_LABELS[value],
}));

/** Гард значения селекта вида отсутствия. */
export const isAiAbsenceKind = (value: unknown): value is AiAbsenceKind =>
    typeof value === 'string' && value in AI_ABSENCE_KIND_LABELS;

/** Отсутствие не уходит дальше этого горизонта вперёд (описание DTO). */
export const AI_ABSENCE_HORIZON_DAYS = 90;

/* ---------- Цели по уровням ---------- */

/** Числовое поле цели уровня (всё, кроме самого уровня). */
export type AiTargetField = keyof Omit<AiLevelTargetInput, 'level'>;

/** Допустимые диапазоны целей — проверка бэка (вне диапазона — 400). */
export const AI_TARGET_LIMITS: Record<
    AiTargetField,
    readonly [number, number]
> = {
    sales: [0, 50],
    presentationsMin: [0, 60],
    coldPerDay: [0, 200],
};

/**
 * Цель уровня по умолчанию (описание DTO): продажи не заданы (null — цель
 * месяца придёт из плана руководителя или личной цели, иначе план дня
 * покажет «цель не задана»), обучающий минимум презентаций новичку 20,
 * остальным 0, холодных в день 40. Текущие цели портала форма берёт из
 * settings/get (targets), этот дефолт — для уровня без записи.
 */
export const defaultAiLevelTarget = (
    level: AiManagerLevel,
): AiLevelTargetInput => ({
    level,
    sales: null,
    presentationsMin: level === 'junior' ? 20 : 0,
    coldPerDay: 40,
});

/* ---------- Блоки settings/save ---------- */

/** Подписи блоков настроек — сводка сохранения, подтверждение, коды. */
export const AI_SETTINGS_BLOCK_LABELS: Record<AiSettingsBlockName, string> = {
    levels: 'Уровни менеджеров',
    targets: 'Цели по уровням',
    absences: 'Отсутствия',
    managerParams: 'Параметры менеджеров',
    definitions: 'Определения событий',
    events: 'Журнал событий',
    modelParams: 'Настройки модели',
    scoring: 'Потолки оценивания',
    hypothesis: 'Гипотеза качества',
    rosterConfirmedAt: 'Подтверждение состава',
};

/**
 * Блоки, правка которых двигает comparableFrom вперёд (описания DTO:
 * определения событий и потолки оценивания). Уровни, цели, отсутствия,
 * гипотеза и подтверждение состава сравнимую историю не рвут.
 */
export const AI_SETTINGS_BREAKING_BLOCKS: readonly AiSettingsBlockName[] = [
    'definitions',
    'scoring',
];

/** Коды ключей настроек в breaksSeries ответа: ai_analytics_<ключ>[.поле]. */
const AI_SETTINGS_CODE_PREFIX = 'ai_analytics_';
const AI_SETTINGS_CODE_BLOCKS: Record<string, AiSettingsBlockName> = {
    levels: 'levels',
    targets: 'targets',
    absences: 'absences',
    model_params: 'modelParams',
    manager_params: 'managerParams',
    definitions: 'definitions',
    events: 'events',
    scoring: 'scoring',
    hypothesis: 'hypothesis',
    roster_confirmed_at: 'rosterConfirmedAt',
};

/** Подпись для кода breaksSeries, который не удалось отнести к блоку. */
export const AI_SETTINGS_UNKNOWN_BLOCK = 'настройки';

/**
 * Код breaksSeries человеком — только подпись блока, без имени поля:
 * ai_analytics_definitions.productiveCall → «Определения событий»;
 * незнакомый код → «настройки» (сырой код не показываем).
 */
export const formatAiSettingsBreakCode = (code: string): string => {
    if (!code.startsWith(AI_SETTINGS_CODE_PREFIX)) {
        return AI_SETTINGS_UNKNOWN_BLOCK;
    }
    const [key = ''] = code.slice(AI_SETTINGS_CODE_PREFIX.length).split('.');
    const block = AI_SETTINGS_CODE_BLOCKS[key];
    return block ? AI_SETTINGS_BLOCK_LABELS[block] : AI_SETTINGS_UNKNOWN_BLOCK;
};

/** Список кодов → подписи блоков без повторов (поля одного блока сливаются). */
export const formatAiSettingsBreakCodes = (codes: readonly string[]): string[] =>
    [...new Set(codes.map(formatAiSettingsBreakCode))];
