/**
 * Константы колонок планов в таблицах отчёта и строках Excel.
 */
import type { PlanFactSource } from '../model';

/**
 * Источники факта, у которых есть колонки в таблицах отчёта: события
 * (kpi, factKey = innerCode) и бакеты звонков (calling, factKey = id).
 * Финансов и эфирного времени в этих таблицах нет — нет и колонок плана.
 */
export const PLAN_COLUMN_FACT_SOURCES = [
    'kpi',
    'calling',
] as const satisfies readonly PlanFactSource[];

export type PlanColumnFactSource = (typeof PLAN_COLUMN_FACT_SOURCES)[number];

/**
 * Таблицы с колонками планов: events — таблица событий (вкладки «Все» и
 * «События»; её же выгружает в Excel вкладка «Звонки»), merged —
 * объединённый отчёт, callings — таблица звонков.
 */
export const PLAN_COLUMNS_TABS = ['events', 'merged', 'callings'] as const;

export type PlanColumnsTab = (typeof PLAN_COLUMNS_TABS)[number];

/** Флаги колонок планов в настройках вида отчёта портала. */
export interface PlanColumnsFlags {
    plansEvents: boolean;
    plansMerged: boolean;
    plansCallings: boolean;
}

/** Какой флаг настроек портала включает колонки планов таблицы. */
export const PLAN_COLUMNS_FLAG: Record<PlanColumnsTab, keyof PlanColumnsFlags> =
    {
        events: 'plansEvents',
        merged: 'plansMerged',
        callings: 'plansCallings',
    };

/** Чьи факты есть в колонках таблицы. */
export const PLAN_COLUMNS_TAB_SOURCES: Record<
    PlanColumnsTab,
    readonly PlanColumnFactSource[]
> = {
    events: ['kpi'],
    merged: ['kpi', 'calling'],
    callings: ['calling'],
};

/** Начало подписи колонки плана по умолчанию: «План: Презентация». */
export const PLAN_COLUMN_LABEL_PREFIX = 'План: ';

/** Ячейка колонки плана, когда план сотруднику не задан. */
export const PLAN_COLUMN_EMPTY_TEXT = '—';

/**
 * Плановая подсветка колонки — светло-голубая (токен темы info), как
 * строки планов в Excel; в тёмной теме — лёгкий голубой тон, текст читается.
 */
export const PLAN_COLUMN_HEADER_CLASS = 'bg-info/15';
export const PLAN_COLUMN_CELL_CLASS = 'bg-info/10';
