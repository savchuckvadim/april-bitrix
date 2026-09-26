import {
    buildAiLevelsForm,
    defaultAiLevelTarget,
    type AiAbsenceKind,
    type AiAnalyticsSettings,
    type AiLevelFormRow,
    type AiLevelTargetInput,
    type AiManagerAbsencesInput,
    type AiManagerLevel,
    type AiManagerRow,
    type AiSettingsBlockName,
    type AiTargetField,
    type AiTargetOverrideInput,
} from '@/modules/entities/ai-analytics';

/*
 * Состояние формы диалога настроек витрины и правки по блокам: каждая
 * правка помечает свой блок изменённым — только такие блоки уходят на
 * сервер. Цели, отсутствия и дата подтверждения предзаполняются из
 * settings/get. Валидация — ai-settings-form.validate.ts, payload и
 * сводка — ai-settings-form.payload.ts. Без React и стора — покрыто vitest.
 */

/** Вкладки диалога. */
export type AiSettingsTab = 'levels' | 'targets' | 'absences' | 'roster';

export const AI_SETTINGS_TABS: readonly AiSettingsTab[] = [
    'levels',
    'targets',
    'absences',
    'roster',
];

export const isAiSettingsTab = (value: unknown): value is AiSettingsTab =>
    typeof value === 'string' &&
    (AI_SETTINGS_TABS as readonly string[]).includes(value);

/** Блоки DTO, которые редактирует диалог. */
export type AiSettingsFormBlock = Extract<
    AiSettingsBlockName,
    'levels' | 'targets' | 'absences' | 'rosterConfirmedAt'
>;

/** Текущие блоки из settings/get — предзаполнение формы. */
export type AiSettingsPrefill = Pick<
    AiAnalyticsSettings,
    'targets' | 'absences' | 'rosterConfirmedAt'
>;

/** Строка целей уровня: значения строками, как в полях; пустые продажи — медиана полосы. */
export interface AiTargetFormRow {
    level: AiManagerLevel;
    sales: string;
    presentationsMin: string;
    coldPerDay: string;
}

/** Строка отсутствия: локальный id — ключ строки и адрес ошибки. */
export interface AiAbsenceFormRow {
    id: number;
    /** Bitrix-id менеджера строкой (значение селекта); '' — не выбран. */
    managerId: string;
    from: string;
    to: string;
    kind: AiAbsenceKind;
}

export interface AiSettingsFormState {
    levels: AiLevelFormRow[];
    targets: AiTargetFormRow[];
    /** Личные цели менеджеров из настроек: не редактируются, уходят вместе с блоком targets. */
    overrides: AiTargetOverrideInput[];
    absences: AiAbsenceFormRow[];
    /** null — не трогали; '' — снять подтверждение; дата — подтвердить. */
    roster: string | null;
    /** Текущая дата подтверждения состава из настроек; null — не подтверждён. */
    rosterConfirmedAt: string | null;
    /** Блоки, которых касались: только они уходят в payload. */
    dirty: AiSettingsFormBlock[];
    nextAbsenceId: number;
}

const AI_LEVELS: readonly AiManagerLevel[] = ['junior', 'middle', 'senior'];

const numberField = (value: number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

/** Строки целей: по каждому уровню — из настроек, иначе по умолчанию. */
export const prefillAiTargetRows = (
    byLevel: readonly AiLevelTargetInput[],
): AiTargetFormRow[] =>
    AI_LEVELS.map(level => {
        const target =
            byLevel.find(item => item.level === level) ??
            defaultAiLevelTarget(level);
        return {
            level,
            sales: numberField(target.sales),
            presentationsMin: String(target.presentationsMin),
            coldPerDay: String(target.coldPerDay),
        };
    });

/** Отрезки настроек → строки формы с локальными id (1..n). */
export const prefillAiAbsenceRows = (
    absences: readonly AiManagerAbsencesInput[],
): AiAbsenceFormRow[] =>
    absences
        .flatMap(manager =>
            manager.items.map(item => ({
                id: 0,
                managerId: String(manager.managerId),
                from: item.from,
                to: item.to,
                kind: item.kind,
            })),
        )
        .map((row, index) => ({ ...row, id: index + 1 }));

export const buildAiSettingsForm = (
    managers: AiManagerRow[],
    settings: AiSettingsPrefill | null = null,
): AiSettingsFormState => {
    const absences = prefillAiAbsenceRows(settings?.absences ?? []);
    return {
        levels: buildAiLevelsForm(managers),
        targets: prefillAiTargetRows(settings?.targets.byLevel ?? []),
        overrides: settings?.targets.overrides ?? [],
        absences,
        roster: null,
        rosterConfirmedAt: settings?.rosterConfirmedAt ?? null,
        dirty: [],
        nextAbsenceId: absences.length + 1,
    };
};

const withDirty = (
    state: AiSettingsFormState,
    block: AiSettingsFormBlock,
): AiSettingsFormState =>
    state.dirty.includes(block)
        ? state
        : { ...state, dirty: [...state.dirty, block] };

/* ---------- Правки ---------- */

export const patchAiLevelRow = (
    state: AiSettingsFormState,
    managerId: number,
    changes: Partial<Pick<AiLevelFormRow, 'level' | 'since'>>,
): AiSettingsFormState =>
    withDirty(
        {
            ...state,
            levels: state.levels.map(row =>
                row.managerId === managerId
                    ? { ...row, ...changes, manual: true }
                    : row,
            ),
        },
        'levels',
    );

export const patchAiTargetRow = (
    state: AiSettingsFormState,
    level: AiManagerLevel,
    field: AiTargetField,
    value: string,
): AiSettingsFormState =>
    withDirty(
        {
            ...state,
            targets: state.targets.map(row =>
                row.level === level ? { ...row, [field]: value } : row,
            ),
        },
        'targets',
    );

export const addAiAbsenceRow = (
    state: AiSettingsFormState,
    managerId = '',
): AiSettingsFormState =>
    withDirty(
        {
            ...state,
            absences: [
                ...state.absences,
                {
                    id: state.nextAbsenceId,
                    managerId,
                    from: '',
                    to: '',
                    kind: 'vacation',
                },
            ],
            nextAbsenceId: state.nextAbsenceId + 1,
        },
        'absences',
    );

export const patchAiAbsenceRow = (
    state: AiSettingsFormState,
    id: number,
    changes: Partial<Omit<AiAbsenceFormRow, 'id'>>,
): AiSettingsFormState =>
    withDirty(
        {
            ...state,
            absences: state.absences.map(row =>
                row.id === id ? { ...row, ...changes } : row,
            ),
        },
        'absences',
    );

export const removeAiAbsenceRow = (
    state: AiSettingsFormState,
    id: number,
): AiSettingsFormState =>
    withDirty(
        { ...state, absences: state.absences.filter(row => row.id !== id) },
        'absences',
    );

/** Подтверждение состава: дата — подтвердить, '' — снять, null — не трогать. */
export const setAiRoster = (
    state: AiSettingsFormState,
    value: string | null,
): AiSettingsFormState =>
    value === null
        ? {
              ...state,
              roster: null,
              dirty: state.dirty.filter(block => block !== 'rosterConfirmedAt'),
          }
        : withDirty({ ...state, roster: value }, 'rosterConfirmedAt');
