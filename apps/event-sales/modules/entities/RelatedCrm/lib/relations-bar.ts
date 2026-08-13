import type { RelatedDeal, RelatedLead } from '../model';
import { leadDisplayTitle } from './lead-status-view';

/**
 * Что показывать полосками в шапке: одна главная сделка крупно, остальные
 * связи — миниатюрами.
 *
 * Полосок помещается немного (шапка — одна тонкая строка во фрейме 630×600),
 * поэтому лишние честно сворачиваются в «+N» с тултипом, а не исчезают.
 */

/** Больше четырёх полосок в строке уже не читаются — остальное в туман. */
export const MAX_RELATION_BARS = 4;

/**
 * В шапке места нет вовсе: главная полоска и хвостик миниатюр. Всё, что не
 * влезло, честно сворачивается в «+N» — оно доступно на экране клиента.
 */
export const MAX_RELATION_BARS_COMPACT = 3;

export type RelationBarKind = 'deal' | 'lead';

export interface RelationBarItem {
    kind: RelationBarKind;
    id: number;
    title: string;
    deal?: RelatedDeal;
    lead?: RelatedLead;
}

export interface RelationsBarView {
    /** Сделка, в которой мы работаем (или самая свежая открытая). */
    main: RelatedDeal | null;
    /** Остальные связи миниатюрами — вместе с главной не больше MAX. */
    minis: RelationBarItem[];
    /** Названия того, что не поместилось: уходит в тултип «+N». */
    hidden: string[];
}

export interface RelationsBarInput {
    deals?: RelatedDeal[];
    leads?: RelatedLead[];
    /** Сделка контекста встройки — она и есть главная. */
    currentDealId?: number | null;
    max?: number;
}

const leadTitle = (lead: RelatedLead): string =>
    (lead as { title?: string }).title || `Заявка #${lead.id}`;

/**
 * Главная сделка + миниатюры остальных.
 *
 * Главной считаем сделку встройки: менеджер смотрит именно на неё, и её
 * стадия — ответ на вопрос «куда двигаемся». Нет такой — берём самую свежую
 * открытую: пустая шапка при живых связях хуже приблизительной.
 */
export const buildRelationsBar = ({
    deals = [],
    leads = [],
    currentDealId = null,
    max = MAX_RELATION_BARS,
}: RelationsBarInput): RelationsBarView => {
    const openDeals = deals.filter(deal => !deal.closed);

    const main =
        openDeals.find(deal => deal.id === Number(currentDealId)) ??
        [...openDeals].sort((a, b) =>
            (b.dateCreate ?? '').localeCompare(a.dateCreate ?? ''),
        )[0] ??
        null;

    const rest: RelationBarItem[] = [
        ...openDeals
            .filter(deal => deal.id !== main?.id)
            .map(deal => ({
                kind: 'deal' as const,
                id: deal.id,
                title: deal.title,
                deal,
            })),
        ...leads.map(lead => ({
            kind: 'lead' as const,
            id: lead.id,
            title: leadDisplayTitle(lead),
            lead,
        })),
    ];

    // Главная занимает одно место из общего лимита.
    const miniLimit = Math.max(0, (main ? max - 1 : max) | 0);

    return {
        main,
        minis: rest.slice(0, miniLimit),
        hidden: rest.slice(miniLimit).map(item => item.title),
    };
};
