import { formatAiDateRu } from './ai-signal.util';
import { AI_CHECKLIST_SECTION_TITLES } from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    buildAiChecklistContext,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    aiAccessItem,
    aiCallCoverageItem,
    aiDataQualityItem,
    aiNotAnalyzedItem,
    aiPilotItem,
    aiPipelineItem,
} from './ai-setup-checklist.coverage';
import {
    aiCalendarItem,
    aiHeadPlansItem,
    aiHypothesisItem,
    aiNormsGatesItem,
    aiPushItem,
    aiRosterItem,
    aiTenureItem,
} from './ai-setup-checklist.configure';
import { aiTargetsItem } from './ai-setup-checklist.targets';
import {
    aiBetaItem,
    aiComparableItem,
    aiHistoryItem,
    aiNormsPresentationsItem,
    aiPortalModelItem,
    aiPresentationsItem,
    aiTrendsItem,
    aiUnknownReasonItems,
    aiYoyItem,
} from './ai-setup-checklist.wait';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_SECTION,
    AI_CHECKLIST_STATUS,
    AI_CHECKLIST_VERDICT,
    type AiChecklistEta,
    type AiChecklistGroup,
    type AiChecklistInput,
    type AiChecklistItem,
    type AiChecklistProgress,
    type AiChecklistSection,
    type AiChecklistSectionKey,
    type AiChecklistVerdict,
    type AiSetupChecklist,
} from './ai-setup-checklist.types';

/*
 * Чек-лист «Готовность витрины»: пункты из настроек, готовности, обзора,
 * плана дня и план-факта → разделы и итог «данные / настроить / подождать
 * / готово» одной фразой. Чистые функции — покрыто vitest.
 */

type ItemBuilder = (ctx: AiChecklistContext) => AiChecklistItem | null;

/** Порядок пунктов внутри раздела — порядок этого списка. */
const BUILDERS: readonly ItemBuilder[] = [
    aiAccessItem,
    aiCallCoverageItem,
    aiPilotItem,
    aiNotAnalyzedItem,
    aiPipelineItem,
    aiDataQualityItem,
    aiTargetsItem,
    aiHeadPlansItem,
    aiRosterItem,
    aiCalendarItem,
    aiNormsGatesItem,
    aiTenureItem,
    aiPushItem,
    aiHypothesisItem,
    aiPortalModelItem,
    aiHistoryItem,
    aiPresentationsItem,
    aiNormsPresentationsItem,
    aiComparableItem,
    aiTrendsItem,
    aiYoyItem,
    aiBetaItem,
];

/** Все пункты чек-листа в порядке показа (без разбиения на разделы). */
export const buildAiChecklistItems = (
    input: AiChecklistInput,
): AiChecklistItem[] => {
    const ctx = buildAiChecklistContext(input);
    return [
        ...BUILDERS.map(build => build(ctx)).filter(
            (item): item is AiChecklistItem => item !== null,
        ),
        ...aiUnknownReasonItems(ctx),
    ];
};

const isTodo = (item: AiChecklistItem, group: AiChecklistGroup): boolean =>
    item.status === AI_CHECKLIST_STATUS.TODO && item.group === group;

/** Открытые блокеры группы (рекомендации не в счёт). */
const blockers = (
    items: readonly AiChecklistItem[],
    group: AiChecklistGroup,
): AiChecklistItem[] =>
    items.filter(item => isTodo(item, group) && !item.optional);

/** Итог по приоритету: данные > настройка > ожидание > готово. */
export const aiChecklistVerdict = (
    items: readonly AiChecklistItem[],
): AiChecklistVerdict => {
    if (blockers(items, AI_CHECKLIST_GROUP.DATA).length) {
        return AI_CHECKLIST_VERDICT.DATA;
    }
    if (blockers(items, AI_CHECKLIST_GROUP.CONFIGURE).length) {
        return AI_CHECKLIST_VERDICT.CONFIGURE;
    }
    if (items.some(item => isTodo(item, AI_CHECKLIST_GROUP.WAIT))) {
        return AI_CHECKLIST_VERDICT.WAIT;
    }
    return AI_CHECKLIST_VERDICT.READY;
};

/** Подпись срока: по расписанию — «03.10.2026, 04:00», по темпу — «≈ 12.11.2026». */
export const formatAiChecklistEta = (eta: AiChecklistEta): string => {
    const date = formatAiDateRu(eta.date);
    if (eta.rough) return `≈ ${date}`;
    return eta.time ? `${date}, ${eta.time}` : date;
};

/** Ближайший срок среди пунктов; без сроков — null. */
export const aiNearestEtaItem = (
    items: readonly AiChecklistItem[],
): (AiChecklistItem & { eta: AiChecklistEta }) | null =>
    items.reduce<(AiChecklistItem & { eta: AiChecklistEta }) | null>(
        (best, item) =>
            item.eta && (!best || item.eta.date < best.eta.date)
                ? { ...item, eta: item.eta }
                : best,
        null,
    );

/** Одна фраза «что делать сейчас» под итог. */
export const aiChecklistHeadline = (
    verdict: AiChecklistVerdict,
    items: readonly AiChecklistItem[],
): string => {
    const H = AI_CHECKLIST_TEXT.headline;
    const first = (group: AiChecklistGroup) => {
        const list = blockers(items, group);
        return { title: list[0]?.title ?? '', more: H.more(list.length - 1) };
    };
    switch (verdict) {
        case AI_CHECKLIST_VERDICT.DATA: {
            const { title, more } = first(AI_CHECKLIST_GROUP.DATA);
            return H.data(title, more);
        }
        case AI_CHECKLIST_VERDICT.CONFIGURE: {
            const { title, more } = first(AI_CHECKLIST_GROUP.CONFIGURE);
            return H.configure(title, more);
        }
        case AI_CHECKLIST_VERDICT.WAIT: {
            const next = aiNearestEtaItem(
                items.filter(item => isTodo(item, AI_CHECKLIST_GROUP.WAIT)),
            );
            return next
                ? H.wait(next.title, formatAiChecklistEta(next.eta))
                : H.waitNoEta;
        }
        default:
            if (
                items.some(
                    item =>
                        item.status === AI_CHECKLIST_STATUS.TODO &&
                        item.optional,
                )
            ) {
                return H.readyOptional;
            }
            // Часть пунктов не проверить (нет обзора, до калибровки) —
            // «в полную силу» было бы обещанием без проверки.
            return items.some(
                item => item.status === AI_CHECKLIST_STATUS.UNKNOWN,
            )
                ? H.readyUnknown
                : H.ready;
    }
};

/** Порядок разделов: три группы, «не проверить», свёрнутое «Готово». */
const SECTION_ORDER: readonly AiChecklistSectionKey[] = [
    AI_CHECKLIST_SECTION.DATA,
    AI_CHECKLIST_SECTION.CONFIGURE,
    AI_CHECKLIST_SECTION.WAIT,
    AI_CHECKLIST_SECTION.UNKNOWN,
    AI_CHECKLIST_SECTION.DONE,
];

const sectionOf = (item: AiChecklistItem): AiChecklistSectionKey => {
    if (item.status === AI_CHECKLIST_STATUS.DONE)
        return AI_CHECKLIST_SECTION.DONE;
    if (item.status === AI_CHECKLIST_STATUS.UNKNOWN) {
        return AI_CHECKLIST_SECTION.UNKNOWN;
    }
    return item.group;
};

/** Непустые разделы; внутри — сначала блокеры, потом рекомендации. */
export const buildAiChecklistSections = (
    items: readonly AiChecklistItem[],
): AiChecklistSection[] =>
    SECTION_ORDER.map(key => ({
        key,
        title: AI_CHECKLIST_SECTION_TITLES[key],
        items: items
            .filter(item => sectionOf(item) === key)
            .sort((a, b) => Number(a.optional) - Number(b.optional)),
    })).filter(section => section.items.length > 0);

/** Чек-лист целиком: итог, фраза и разделы. */
export const buildAiSetupChecklist = (
    input: AiChecklistInput,
): AiSetupChecklist => {
    const items = buildAiChecklistItems(input);
    const verdict = aiChecklistVerdict(items);
    return {
        verdict,
        headline: aiChecklistHeadline(verdict, items),
        sections: buildAiChecklistSections(items),
    };
};

/**
 * «Не проверить сейчас» одной строкой на причину: «Тренды по неделям ·
 * Сравнение с прошлым годом — проверим, когда посчитается обзор.».
 */
export const aiChecklistUnknownLines = (
    items: readonly AiChecklistItem[],
): string[] => {
    const byDetail = new Map<string, string[]>();
    for (const item of items) {
        byDetail.set(item.detail, [
            ...(byDetail.get(item.detail) ?? []),
            item.title,
        ]);
    }
    return [...byDetail].map(
        ([detail, titles]) =>
            `${titles.join(' · ')} — ${detail.charAt(0).toLowerCase()}${detail.slice(1)}`,
    );
};

/** Прогресс «3 из 8» и доля 0..1 для полосы. */
export const formatAiChecklistProgress = (
    progress: AiChecklistProgress,
): string => `${progress.value} из ${progress.target}`;

export const aiChecklistProgressShare = (
    progress: AiChecklistProgress,
): number =>
    progress.target > 0
        ? Math.max(0, Math.min(1, progress.value / progress.target))
        : 0;
