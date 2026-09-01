/**
 * Дата-библиотека флоу — зеркало back/libs/shared/src/lib/date (замена
 * бэкового импорта `@/shared/lib/date`). Спутники BitrixDateTime живут
 * уровнем выше (донор А0, src/shared/lib/*) — здесь их реэкспорт повторяет
 * бэковый index, чтобы поверхность модуля совпадала.
 */
export * from '../timezone';
export * from '../parse-portal-input';
export * from '../to-task-deadline';
export * from '../to-crm-datetime';
export * from '../to-ru-human';
export * from './bitrix-datetime';
export * from '../contract-months';
/**
 * PBX-обёртка (бэковый дом — back/libs/portal-lib/pbx/domain/src/date):
 * на бэке это отдельный модуль `@lib/portal-lib/pbx-domain/date/pbx-datetime`,
 * в пакете обе половины собраны в один каталог (решение плана А1).
 */
export * from './pbx-datetime';
