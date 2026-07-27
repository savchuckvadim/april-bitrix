/**
 * Константы фичи pbx-полей: тайминги статус-бейджа и статусы редактирования.
 * Данные отдельно от UI (правило репо).
 */

/** Статусы inline-редактирования одного поля одной сущности. */
export const PBX_EDIT_STATUSES = ['saving', 'saved', 'error'] as const;
export type PbxEditStatus = (typeof PBX_EDIT_STATUSES)[number];

/** Сколько показывать зелёную галочку успеха до исчезновения. */
export const PBX_SAVED_BADGE_MS = 1_500;

/**
 * Сколько показывать ошибку до автоматического отката значения к прежнему
 * (optimistic-запись не удалась — UI возвращается к правде Bitrix).
 */
export const PBX_ERROR_REVERT_MS = 2_500;
