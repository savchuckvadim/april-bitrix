import type { AiPulseAlert, AiPulseAlertKind } from '../model';
import { AI_ALERT_KIND } from './ai-pulse.data';
import { countUnhandledAlerts, sortAiAlerts } from './ai-pulse.util';

/*
 * Список сигналов «Пульса» для руководителя: фильтр «Не отработано / Все»,
 * свёрнутый вид (первые N строк) и подписи к строке — ссылка на разбор,
 * «что сделать». Чистая логика; состояние (фильтр, развёрнуто) хранит UI.
 */

/** Сколько сигналов видно в свёрнутом списке. */
export const AI_PULSE_ALERTS_COLLAPSED_MAX = 5;

export const AI_PULSE_ALERTS_FILTER = {
    UNHANDLED: 'unhandled',
    ALL: 'all',
} as const;

export type AiPulseAlertsFilter =
    (typeof AI_PULSE_ALERTS_FILTER)[keyof typeof AI_PULSE_ALERTS_FILTER];

export const isAiPulseAlertsFilter = (
    value: string,
): value is AiPulseAlertsFilter =>
    value === AI_PULSE_ALERTS_FILTER.UNHANDLED ||
    value === AI_PULSE_ALERTS_FILTER.ALL;

/** Фильтр по умолчанию: пока есть неотработанные — они, иначе все. */
export const defaultAiPulseAlertsFilter = (
    alerts: readonly AiPulseAlert[],
): AiPulseAlertsFilter =>
    countUnhandledAlerts([...alerts]) > 0
        ? AI_PULSE_ALERTS_FILTER.UNHANDLED
        : AI_PULSE_ALERTS_FILTER.ALL;

export const filterAiPulseAlerts = (
    alerts: readonly AiPulseAlert[],
    filter: AiPulseAlertsFilter,
): AiPulseAlert[] =>
    filter === AI_PULSE_ALERTS_FILTER.UNHANDLED
        ? alerts.filter(alert => !alert.handled)
        : [...alerts];

export interface AiPulseAlertsFilterOption {
    value: AiPulseAlertsFilter;
    label: string;
}

/** Сегменты фильтра со счётчиками: «Не отработано (3) / Все (68)». */
export const aiPulseAlertsFilterOptions = (
    alerts: readonly AiPulseAlert[],
): AiPulseAlertsFilterOption[] => [
    {
        value: AI_PULSE_ALERTS_FILTER.UNHANDLED,
        label: `Не отработано (${countUnhandledAlerts([...alerts])})`,
    },
    { value: AI_PULSE_ALERTS_FILTER.ALL, label: `Все (${alerts.length})` },
];

export interface AiPulseAlertsViewOptions {
    filter: AiPulseAlertsFilter;
    expanded: boolean;
    /** Строк в свёрнутом виде (по умолчанию AI_PULSE_ALERTS_COLLAPSED_MAX). */
    max?: number;
}

export interface AiPulseAlertsView {
    /** Строки к показу: неотработанные сверху, новые выше. */
    rows: AiPulseAlert[];
    /** Сколько сигналов проходит фильтр. */
    total: number;
    /** Сколько спрятано в свёрнутом виде. */
    hidden: number;
    /** Есть что сворачивать/разворачивать. */
    canToggle: boolean;
}

/** Строки списка по фильтру и состоянию «развёрнуто». */
export const buildAiPulseAlertsView = (
    alerts: readonly AiPulseAlert[],
    {
        filter,
        expanded,
        max = AI_PULSE_ALERTS_COLLAPSED_MAX,
    }: AiPulseAlertsViewOptions,
): AiPulseAlertsView => {
    const list = sortAiAlerts(filterAiPulseAlerts(alerts, filter));
    const rows = expanded ? list : list.slice(0, max);
    return {
        rows,
        total: list.length,
        hidden: list.length - rows.length,
        canToggle: list.length > max,
    };
};

/** Подпись кнопки под списком: «Показать все 68» / «Свернуть». */
export const aiPulseAlertsToggleLabel = (
    view: Pick<AiPulseAlertsView, 'total'>,
    expanded: boolean,
): string => (expanded ? 'Свернуть' : `Показать все ${view.total}`);

/** Пустой список после фильтра: что показать вместо строк. */
export const AI_PULSE_ALERTS_EMPTY = {
    none: 'Сигналов за окно нет.',
    allHandled: 'Все сигналы отработаны — посмотреть их можно в «Все».',
} as const;

export const aiPulseAlertsEmptyText = (
    alerts: readonly AiPulseAlert[],
    filter: AiPulseAlertsFilter,
): string =>
    alerts.length && filter === AI_PULSE_ALERTS_FILTER.UNHANDLED
        ? AI_PULSE_ALERTS_EMPTY.allHandled
        : AI_PULSE_ALERTS_EMPTY.none;

/**
 * Ссылка на карточку разбора; null — элемента разбора ещё нет. Старые
 * кэшированные ответы поля не имели — undefined тоже считаем «нет ссылки».
 */
export const aiAlertLink = (alert: Pick<AiPulseAlert, 'link'>): string | null =>
    typeof alert.link === 'string' && alert.link.trim() !== ''
        ? alert.link
        : null;

/** «Что сделать: …» по виду сигнала. */
export const aiAlertActionLine = (kind: AiPulseAlertKind): string =>
    `Что сделать: ${AI_ALERT_KIND[kind].action}`;

/** Строки подсказки бэйджа вида: что значит сигнал и что сделать. */
export const aiAlertHintLines = (kind: AiPulseAlertKind): string[] => [
    AI_ALERT_KIND[kind].hint,
    aiAlertActionLine(kind),
];
