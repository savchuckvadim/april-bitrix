import type {
    TakeoverPreview,
    TakeoverPreviewDeal,
    TakeoverPreviewDealKind,
} from '../model/types';

/** Как назвать закрываемую сделку по её воронке. */
const KIND_LABEL: Record<TakeoverPreviewDealKind, string> = {
    base: 'сделка',
    xo: 'сделка холодного обзвона',
    pres: 'сделка презентации',
};

const dealLine = (deal: TakeoverPreviewDeal): string =>
    `${KIND_LABEL[deal.kind]} «${deal.title}» — ${deal.ownerName}`;

export interface ClientTakeoverView {
    /** Что перейдёт к менеджеру; null — у него своя сделка. */
    taken: string | null;
    /** Что закроется — по строке на сделку и сводка по задачам и элементам. */
    closes: string[];
    /** Что не тронется (поздние стадии) — по строке на сделку. */
    kept: string[];
}

/**
 * Тексты окна «Забрать работу коллег себе?» — чистые функции от ответа
 * бэка, без кодов и служебных слов (правило клиентских текстов).
 */
export const describeTakeover = (preview: TakeoverPreview): ClientTakeoverView => {
    const taken = preview.takenDeal
        ? `${dealLine(preview.takenDeal)}` +
          (preview.movedTasks
              ? ` и её задачи (${preview.movedTasks})`
              : '')
        : null;

    const closes = preview.closeDeals.map(dealLine);
    const counts: string[] = [];
    if (preview.closedTasks) counts.push(`задачи: ${preview.closedTasks}`);
    if (preview.closedPresentations) {
        counts.push(`презентации: ${preview.closedPresentations}`);
    }
    if (preview.closedZpr) counts.push(`ЗПР: ${preview.closedZpr}`);
    if (counts.length) closes.push(`а также ${counts.join(', ')}`);

    return {
        taken,
        closes,
        kept: preview.protectedDeals.map(dealLine),
    };
};
