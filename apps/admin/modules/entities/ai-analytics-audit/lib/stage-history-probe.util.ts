import type { Tone } from '@workspace/april-ui/tones';
import { STAGE_HISTORY_PROBE_TEXT } from '../consts/ai-analytics-audit.const';
import type { AiAnalyticsStageHistoryProbe } from '../model';
import { formatAuditDateTime } from './audit-format.util';

/** Бейдж пробы: подпись и тон. */
export interface StageHistoryProbeBadge {
    label: string;
    tone: Tone;
}

/** Поле результата пробы: подпись + значение уже строкой. */
export interface StageHistoryProbeField {
    key: string;
    title: string;
    value: string;
}

/** Результат пробы, разложенный под карточку: тон, бейджи, поля строками. */
export interface StageHistoryProbeView {
    /**
     * Тон карточки: недоступно — destructive; доступно, но глубины не
     * хватает — warning; достаточно — success.
     */
    tone: Tone;
    availability: StageHistoryProbeBadge;
    enough: StageHistoryProbeBadge;
    /** Вывод бэка целиком — главное, что читает владелец. */
    hint: string;
    /** Текст ошибки Bitrix; null — метод ответил без ошибки. */
    error: string | null;
    fields: StageHistoryProbeField[];
}

/** Месяцы с «—» вместо null (null — записей истории нет). */
export const formatProbeMonths = (value: number | null): string =>
    value === null
        ? '—'
        : `${value} ${STAGE_HISTORY_PROBE_TEXT.monthsUnit}`;

/**
 * Переходов за окно: «—», если метод недоступен; «не меньше N», если Bitrix
 * не вернул total и это лишь размер первой страницы; иначе точное число.
 */
export const formatProbeTransitions = (
    count: number | null,
    isLowerBound: boolean,
): string => {
    if (count === null) return '—';
    return isLowerBound
        ? `${STAGE_HISTORY_PROBE_TEXT.lowerBound} ${count}`
        : String(count);
};

/** Категория пробы: «#id» воронки sales_base или «все воронки», если не настроена. */
export const formatProbeCategory = (categoryBitrixId: number | null): string =>
    categoryBitrixId === null
        ? STAGE_HISTORY_PROBE_TEXT.allCategories
        : `#${categoryBitrixId}`;

const buildAvailabilityBadge = (
    available: boolean,
): StageHistoryProbeBadge =>
    available
        ? { label: STAGE_HISTORY_PROBE_TEXT.available, tone: 'success' }
        : { label: STAGE_HISTORY_PROBE_TEXT.unavailable, tone: 'destructive' };

const buildEnoughBadge = (
    probe: Pick<AiAnalyticsStageHistoryProbe, 'available' | 'enough'>,
): StageHistoryProbeBadge => {
    if (probe.enough) {
        return { label: STAGE_HISTORY_PROBE_TEXT.enough, tone: 'success' };
    }
    return {
        label: STAGE_HISTORY_PROBE_TEXT.notEnough,
        tone: probe.available ? 'warning' : 'destructive',
    };
};

/** Ответ ручки пробы → модель карточки результата. */
export const buildStageHistoryProbeView = (
    probe: AiAnalyticsStageHistoryProbe,
): StageHistoryProbeView => ({
    tone: !probe.available
        ? 'destructive'
        : probe.enough
          ? 'success'
          : 'warning',
    availability: buildAvailabilityBadge(probe.available),
    enough: buildEnoughBadge(probe),
    hint: probe.hint,
    error: probe.error,
    fields: [
        {
            key: 'earliestAt',
            title: STAGE_HISTORY_PROBE_TEXT.earliestAt,
            value: formatAuditDateTime(probe.earliestAt),
        },
        {
            key: 'historyMonths',
            title: STAGE_HISTORY_PROBE_TEXT.historyMonths,
            value: formatProbeMonths(probe.historyMonths),
        },
        {
            key: 'windowMonths',
            title: STAGE_HISTORY_PROBE_TEXT.windowMonths,
            value: formatProbeMonths(probe.windowMonths),
        },
        {
            key: 'transitionsInWindow',
            title: STAGE_HISTORY_PROBE_TEXT.transitions,
            value: formatProbeTransitions(
                probe.transitionsInWindow,
                probe.countIsLowerBound,
            ),
        },
        {
            key: 'category',
            title: STAGE_HISTORY_PROBE_TEXT.category,
            value: formatProbeCategory(probe.categoryBitrixId),
        },
        {
            key: 'checkedAt',
            title: STAGE_HISTORY_PROBE_TEXT.checkedAt,
            value: formatAuditDateTime(probe.checkedAt),
        },
    ],
});
