import {
    AI_SETTINGS_BLOCK_LABELS,
    AI_SETTINGS_BREAKING_BLOCKS,
    formatAiSettingsBreakCode,
    pluralRu,
    toAiLevelsPayload,
    type AiLevelTargetInput,
    type AiManagerAbsencesInput,
    type AiSettingsBlockName,
    type AiSettingsInput,
    type AiSettingsSaveResult,
} from '@/modules/entities/ai-analytics';
import type {
    AiAbsenceFormRow,
    AiSettingsFormState,
    AiSettingsPrefill,
    AiTargetFormRow,
} from './ai-settings-form.util';

/*
 * Диф формы → payload settings/save (только изменённые блоки), блоки,
 * рвущие сравнимую историю (подтверждение перед сохранением), сводка
 * результата сервера и «настройки после сохранения» для предзаполнения.
 */

const toLevelTarget = (row: AiTargetFormRow): AiLevelTargetInput => ({
    level: row.level,
    sales: row.sales.trim() === '' ? null : Number(row.sales),
    presentationsMin: Number(row.presentationsMin),
    coldPerDay: Number(row.coldPerDay),
});

/** Строки отсутствий → блок DTO: по менеджеру, отрезки по дате начала. */
export const groupAiAbsences = (
    rows: AiAbsenceFormRow[],
): AiManagerAbsencesInput[] => {
    const byManager = new Map<number, AiManagerAbsencesInput['items']>();
    for (const row of rows) {
        const managerId = Number(row.managerId);
        const items = byManager.get(managerId) ?? [];
        items.push({ from: row.from, to: row.to, kind: row.kind });
        byManager.set(managerId, items);
    }
    return [...byManager].map(([managerId, items]) => ({
        managerId,
        items: [...items].sort((left, right) =>
            left.from.localeCompare(right.from),
        ),
    }));
};

/**
 * Payload settings/save: только блоки, которых касались (не переданный
 * блок сервер не трогает). Сервер заменяет блок целиком, поэтому targets
 * уходит с личными целями (overrides) из настроек, а отсутствия — полным
 * списком, в том числе пустым (все строки удалены — отсутствий нет).
 */
export const toAiSettingsPayload = (
    state: AiSettingsFormState,
): AiSettingsInput => {
    const payload: AiSettingsInput = {};
    if (state.dirty.includes('levels')) {
        payload.levels = toAiLevelsPayload(state.levels);
    }
    if (state.dirty.includes('targets')) {
        payload.targets = {
            byLevel: state.targets.map(toLevelTarget),
            overrides: state.overrides,
        };
    }
    if (state.dirty.includes('absences')) {
        payload.absences = groupAiAbsences(state.absences);
    }
    if (state.dirty.includes('rosterConfirmedAt') && state.roster !== null) {
        payload.rosterConfirmedAt = state.roster;
    }
    return payload;
};

/**
 * Настройки после успешного сохранения payload — предзаполнение следующего
 * открытия, пока settings/get (кэш 300 с) не перечитан: сохранённые блоки
 * перекрывают текущие, '' в rosterConfirmedAt — снятие (null).
 */
export const applyAiSettingsPayload = (
    settings: AiSettingsPrefill,
    payload: AiSettingsInput,
): AiSettingsPrefill => ({
    targets: payload.targets ?? settings.targets,
    absences: payload.absences ?? settings.absences,
    rosterConfirmedAt:
        payload.rosterConfirmedAt === undefined
            ? settings.rosterConfirmedAt
            : payload.rosterConfirmedAt || null,
});

/** Блоки, которые несёт payload (для подписи «Будет сохранено»). */
export const aiSettingsPayloadBlocks = (
    payload: AiSettingsInput,
): AiSettingsBlockName[] =>
    (Object.keys(payload) as AiSettingsBlockName[]).filter(
        block => payload[block] !== undefined,
    );

/** Блоки payload, правка которых сдвинет comparableFrom — нужно подтверждение. */
export const aiSettingsBreakingBlocks = (
    payload: AiSettingsInput,
): AiSettingsBlockName[] =>
    aiSettingsPayloadBlocks(payload).filter(block =>
        AI_SETTINGS_BREAKING_BLOCKS.includes(block),
    );

/* ---------- Сводка результата ---------- */

export interface AiSettingsSaveSummary {
    /** Что сохранено — по блокам payload. */
    saved: string[];
    /** Начало сравнимой истории после сохранения; '' — не рвалась. */
    comparableFrom: string;
    /** Коды, сдвинувшие comparableFrom, человеком. */
    breaks: string[];
    warnings: string[];
    resetCount: number;
}

const MANAGER_FORMS = ['менеджер', 'менеджера', 'менеджеров'] as const;

const countManagers = (count: number): string =>
    `${count} ${pluralRu(count, MANAGER_FORMS)}`;

/** Строки «что сохранено» по payload. */
export const describeAiSettingsPayload = (payload: AiSettingsInput): string[] =>
    aiSettingsPayloadBlocks(payload).map(block => {
        const label = AI_SETTINGS_BLOCK_LABELS[block];
        switch (block) {
            case 'levels':
                return `${label}: ${countManagers(payload.levels?.length ?? 0)}`;
            case 'absences':
                return `${label}: ${countManagers(payload.absences?.length ?? 0)}`;
            case 'rosterConfirmedAt':
                return payload.rosterConfirmedAt
                    ? `${label}: ${payload.rosterConfirmedAt}`
                    : `${label}: снято`;
            default:
                return label;
        }
    });

export const buildAiSettingsSummary = (
    payload: AiSettingsInput,
    result: AiSettingsSaveResult,
): AiSettingsSaveSummary => ({
    saved: describeAiSettingsPayload(payload),
    comparableFrom: result.comparableFrom,
    breaks: result.breaksSeries.map(formatAiSettingsBreakCode),
    warnings: result.warnings,
    resetCount: result.resetCount,
});
