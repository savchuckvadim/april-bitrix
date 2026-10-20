import type { AiOverview } from '@/modules/entities/ai-analytics/model';
import {
    formatAiDay,
    formatAiMoment,
    type AiHint,
} from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { AI_OVERVIEW_META_TEXT } from './ai-overview-meta.texts';

/*
 * Строка над таблицей сигналов: какие пункты показать и с какими
 * подсказками. Чистая функция — «прочее» только при оценённых звонках,
 * «сотрудник не определён» и «по старым правилам» только при ненулевом
 * счётчике, старый кэш без excludedBeforeComparable — без пункта.
 */

export interface AiOverviewMetaItem {
    key: string;
    text: string;
    /** null — пункт без подсказки (период, момент расчёта). */
    hint: AiHint | null;
}

export interface AiOverviewMetaContext {
    /** Порог длительности звонка для разбора; null — не известен. */
    minDurationSec: number | null;
}

const T = AI_OVERVIEW_META_TEXT;

/** Дата сравнимости: из готовности обзора, иначе из корня ответа; пусто — null. */
export const aiOverviewComparableFrom = (
    overview: Pick<AiOverview, 'readiness' | 'comparableFrom'>,
): string | null =>
    overview.readiness.comparableFrom || overview.comparableFrom || null;

export const buildAiOverviewMetaItems = (
    overview: AiOverview,
    ctx: AiOverviewMetaContext,
): AiOverviewMetaItem[] => {
    const { period, meta } = overview;
    const comparableFrom = aiOverviewComparableFrom(overview);
    const items: AiOverviewMetaItem[] = [
        {
            key: 'period',
            text: `${formatAiDay(period.from)} – ${formatAiDay(period.to)} · ${period.workdays} раб. дн.`,
            hint: null,
        },
        {
            key: 'analyzed',
            text: T.analyzed.label(meta.analyzedCalls, meta.totalCalls),
            hint: T.analyzed.hint(ctx.minDurationSec, comparableFrom),
        },
    ];
    if (meta.analyzedCalls > 0) {
        items.push({
            key: 'other',
            text: T.other.label(meta.otherSharePct),
            hint: T.other.hint,
        });
    }
    if (meta.skippedNoManager > 0) {
        items.push({
            key: 'no-manager',
            text: T.noManager.label(meta.skippedNoManager),
            hint: T.noManager.hint,
        });
    }
    if ((meta.excludedBeforeComparable ?? 0) > 0) {
        items.push({
            key: 'before-comparable',
            text: T.beforeComparable.label(meta.excludedBeforeComparable ?? 0),
            hint: T.beforeComparable.hint(comparableFrom),
        });
    }
    if (meta.disagreementsCount > 0) {
        items.push({
            key: 'disagreements',
            text: T.disagreements.label(meta.disagreementsCount),
            hint: T.disagreements.hint,
        });
    }
    items.push({
        key: 'generated-at',
        text: T.generatedAt(formatAiMoment(meta.generatedAt)),
        hint: null,
    });
    return items;
};
