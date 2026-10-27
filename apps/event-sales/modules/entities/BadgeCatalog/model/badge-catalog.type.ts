import { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { WorkStatusCode } from '@/modules/entities/EventReport/type/event-report-type';

/**
 * Каталог бейджиков — готовых формулировок, которые менеджер ставит одним
 * нажатием в комментарий отчёта или в название планируемого события.
 *
 * Состав задаёт портал (общий набор из кода либо свой из админки) и
 * приезжает во фрейм с бэка (`GET /api/badges`). Коды здесь — закрытые
 * наборы, зеркало реестра бэка
 * (back/libs/portal-lib/store/badges/portal-badges.schema.ts): значение,
 * которого фрейм не знает, отсеивается при разборе, а не доезжает до UI.
 */

/** Куда вставляется текст бейджика. */
export type BadgeTarget = 'comment' | 'title';
export const BADGE_TARGETS = ['comment', 'title'] as const satisfies readonly BadgeTarget[];

/**
 * Итог работы, при котором виден бейджик комментария: статус работы отчёта
 * либо факт «презентация проведена» (любой статус, но после презентации).
 */
export type BadgeOutcome = WorkStatusCode | 'presentationDone';
export const BADGE_OUTCOMES = [
    'inJob',
    'setAside',
    'success',
    'fail',
    'notCa',
    'presentationDone',
] as const satisfies readonly BadgeOutcome[];

/** Цвет бейджика — статусные тоны дизайн-системы April. */
export type BadgeTone =
    | 'neutral'
    | 'muted'
    | 'primary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'info';
export const BADGE_TONES = [
    'neutral',
    'muted',
    'primary',
    'accent',
    'success',
    'warning',
    'destructive',
    'info',
] as const satisfies readonly BadgeTone[];

/** Типы планируемого события — коды справочника планов фрейма. */
export const BADGE_PLAN_TYPES: readonly EV_PLAN_CODE[] = Object.values(EV_PLAN_CODE);

export interface BadgeItem {
    /** Стабильный код — для ключей списка и диагностики. */
    code: string;
    /** Текст, который встаёт в поле. */
    text: string;
    target: BadgeTarget;
    tone: BadgeTone;
    /** Комментарий: при каких итогах показывать; пусто — всегда. */
    outcomes: BadgeOutcome[];
    /** Название: для каких типов события; пусто — для всех. */
    planTypes: EV_PLAN_CODE[];
    /** Название: основной текст типа — подставляется сам при выборе типа. */
    isDefault: boolean;
    sort: number;
}

/** Откуда действующий набор: общий из кода или свой портала. */
export type BadgeCatalogMode = 'default' | 'own';
