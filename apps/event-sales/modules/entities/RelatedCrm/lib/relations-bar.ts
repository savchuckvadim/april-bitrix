import type { RelatedDeal, RelatedLead } from '../model';
import { isBaseSalesDeal } from './deal-category';
import { isLeadOpen, leadDisplayTitle } from './lead-status-view';

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

/**
 * Что пускать в строку связей:
 * - `all` — основная сделка, остальные сделки и заявки (по умолчанию);
 * - `baseOnly` — только основная сделка;
 * - `baseLead` — основная сделка и заявки, без прочих сделок;
 * - `deals` — только сделки, без заявок.
 *
 * Состав адаптируется: если сделок нет вовсе, а заявки режимом разрешены,
 * крупной полоской показывается заявка — иначе строка была бы пустой ровно
 * там, где работа только начинается.
 */
export type RelationsBarMode = 'all' | 'baseOnly' | 'baseLead' | 'deals';

export interface RelationsBarView {
    /** Главная полоска: основная сделка, а без сделок — заявка. */
    main: RelationBarItem | null;
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
    mode?: RelationsBarMode;
}

const dealItem = (deal: RelatedDeal): RelationBarItem => ({
    kind: 'deal',
    id: deal.id,
    title: deal.title,
    deal,
});

const leadItem = (lead: RelatedLead): RelationBarItem => ({
    kind: 'lead',
    id: lead.id,
    title: leadDisplayTitle(lead),
    lead,
});

/**
 * Главная полоска + миниатюры остальных.
 *
 * Главная — открытая сделка воронки «ОП Основная» (sales_base): её градиент
 * из карточек дел убран и живёт ТОЛЬКО здесь — покажи шапка другую, основная
 * воронка не была бы видна нигде. Нет основной — сделка встройки (менеджер
 * смотрит именно на неё); нет и её — самая свежая открытая: пустая шапка при
 * живых связях хуже приблизительной. Сделок нет совсем — крупно показываем
 * заявку (если режим её пускает): у первичного клиента вся работа в ней.
 *
 * Заявки фильтруются по открытости: закрытая и сконвертированная в строке
 * работы не нужны — они уже никуда не двигаются.
 */
export const buildRelationsBar = ({
    deals = [],
    leads = [],
    currentDealId = null,
    max = MAX_RELATION_BARS,
    mode = 'all',
}: RelationsBarInput): RelationsBarView => {
    const withLeads = mode === 'all' || mode === 'baseLead';
    const withOtherDeals = mode === 'all' || mode === 'deals';

    const openDeals = deals.filter(deal => !deal.closed);
    const openLeads = withLeads
        ? leads.filter(lead => isLeadOpen(lead.statusSemanticId))
        : [];
    const byFreshness = [...openDeals].sort((a, b) =>
        (b.dateCreate ?? '').localeCompare(a.dateCreate ?? ''),
    );

    const mainDeal =
        byFreshness.find(isBaseSalesDeal) ??
        openDeals.find(deal => deal.id === Number(currentDealId)) ??
        byFreshness[0] ??
        null;

    const main = mainDeal
        ? dealItem(mainDeal)
        : (openLeads[0] && leadItem(openLeads[0])) || null;

    // Сравниваем и вид, и id: у сделки с заявкой номера независимые и вполне
    // могут совпасть — по одному id заявка выпала бы из строки ни за что.
    const isMain = (kind: RelationBarKind, id: number) =>
        main?.kind === kind && main.id === id;

    const rest: RelationBarItem[] = [
        ...(withOtherDeals
            ? openDeals
                  .filter(deal => !isMain('deal', deal.id))
                  .map(dealItem)
            : []),
        ...openLeads.filter(lead => !isMain('lead', lead.id)).map(leadItem),
    ];

    // Главная занимает одно место из общего лимита.
    const miniLimit = Math.max(0, (main ? max - 1 : max) | 0);

    return {
        main,
        minis: rest.slice(0, miniLimit),
        hidden: rest.slice(miniLimit).map(item => item.title),
    };
};
