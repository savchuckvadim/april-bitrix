import type { RelatedDeal, RelatedLead } from '../model';
import { isBaseSalesDeal } from './deal-category';
import { isOwnDeal } from './deal-ownership';
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

/**
 * О чём предупредить менеджера рядом с выбором главной полоски:
 *  - `ownOpenSwitch` — сделка контекста закрыта, работа автоматически
 *    продолжается в другой СВОЕЙ открытой сделке (инфо-хинт);
 *  - `foreignOpen` — у клиента есть открытая сделка ДРУГОГО менеджера, и
 *    автопереключения на неё намеренно не было (warning-хинт).
 */
export type RelationsBarNotice =
    | { kind: 'ownOpenSwitch'; deal: RelatedDeal }
    | { kind: 'foreignOpen'; deal: RelatedDeal };

export interface RelationsBarView {
    /** Главная полоска: основная сделка, а без сделок — заявка. */
    main: RelationBarItem | null;
    /** Остальные связи миниатюрами — вместе с главной не больше MAX. */
    minis: RelationBarItem[];
    /** Названия того, что не поместилось: уходит в тултип «+N». */
    hidden: string[];
    /** Предупреждение о выборе главной (автопереключение / чужая открытая). */
    notice: RelationsBarNotice | null;
}

export interface RelationsBarInput {
    deals?: RelatedDeal[];
    /**
     * Сделки привязок задач клиента (слайс taskDeals, `UF_CRM_TASK: D_<id>`).
     *
     * Отдельный вход, потому что граф клиента о них может не знать: лид,
     * «преобразованный в новый стиль», рождает сделку БЕЗ стандартного
     * LEAD_ID (связь пишется в UF-поле), и запрос связей по лиду её не
     * находит. Привязка задачи — первоисточник «сделки этого дела», по ней
     * же считается отчёт, поэтому в строке она участвует наравне с графом.
     */
    boundDeals?: RelatedDeal[];
    leads?: RelatedLead[];
    /** Сделка контекста встройки — она и есть главная. */
    currentDealId?: number | null;
    /**
     * Пользователь фрейма — включает правило владения: открытые сделки
     * ДРУГОГО ответственного в выбор главной не идут (остаются миниатюрами).
     * Не задан — правило выключено (dev, бут), поведение прежнее.
     */
    currentUserId?: number | null;
    /**
     * Сделка контекста закрыта — по данным плейсмента (`BXDeal.CLOSED`).
     * Граф связей закрытых по умолчанию не отдаёт, поэтому по одному лишь
     * отсутствию сделки в `deals` «закрыта» утверждать нельзя.
     */
    currentDealClosed?: boolean | null;
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
 * Граф клиента + привязки задач, дедуп по id. Версия графа богаче
 * (ответственный, категория с бэка) — при совпадении остаётся она,
 * привязки только добавляют сделки, которых граф не увидел.
 */
const mergeDealSources = (
    deals: RelatedDeal[],
    boundDeals: RelatedDeal[],
): RelatedDeal[] => {
    if (!boundDeals.length) return deals;
    const known = new Set(deals.map(deal => deal.id));
    return [...deals, ...boundDeals.filter(deal => !known.has(deal.id))];
};

/**
 * Главная полоска + миниатюры остальных.
 *
 * Главная — открытая сделка воронки «ОП Основная» (sales_base): её градиент
 * из карточек дел убран и живёт ТОЛЬКО здесь — покажи шапка другую, основная
 * воронка не была бы видна нигде. Основная-сделка-встройки в приоритете над
 * «самой свежей» (ровно как на бэке: отчёт двигает сделку плейсмента).
 * Нет основной — сделка встройки (менеджер смотрит именно на неё); нет и её —
 * самая свежая открытая: пустая шапка при живых связях хуже приблизительной.
 * Сделок нет совсем — крупно показываем заявку (если режим её пускает):
 * у первичного клиента вся работа в ней.
 *
 * Заявки фильтруются по открытости: закрытая и сконвертированная в строке
 * работы не нужны — они уже никуда не двигаются.
 *
 * Сделки собираются из ДВУХ источников: графа клиента и привязок задач
 * (`boundDeals`). У лид-клиента без компании граф сделок не видит (см.
 * RelationsBarInput), и без привязок шапка была бы пуста ровно у того, чью
 * сделку двигает ближайший отчёт.
 *
 * Правило владения (задача 2508): в АВТОвыбор главной идут только СВОИ
 * открытые сделки. Чужая открытая главной не становится никогда — если своих
 * открытых нет, главной остаётся сделка контекста (даже закрытая, когда она
 * есть в данных), а про чужую говорит `notice` (имя ответственного — в самой
 * сделке). Чужие сделки при этом остаются в миниатюрах и «+N».
 */
export const buildRelationsBar = ({
    deals = [],
    boundDeals = [],
    leads = [],
    currentDealId = null,
    currentUserId = null,
    currentDealClosed = null,
    max = MAX_RELATION_BARS,
    mode = 'all',
}: RelationsBarInput): RelationsBarView => {
    const withLeads = mode === 'all' || mode === 'baseLead';
    const withOtherDeals = mode === 'all' || mode === 'deals';

    const isOwn = (deal: RelatedDeal) => isOwnDeal(deal, currentUserId);
    const byFreshnessOf = (items: RelatedDeal[]) =>
        [...items].sort((a, b) =>
            (b.dateCreate ?? '').localeCompare(a.dateCreate ?? ''),
        );

    const mergedDeals = mergeDealSources(deals, boundDeals);
    const openDeals = mergedDeals.filter(deal => !deal.closed);
    const openLeads = withLeads
        ? leads.filter(lead => isLeadOpen(lead.statusSemanticId))
        : [];
    // Автовыбор — только среди своих: чужая открытая не должна молча стать
    // «текущей работой» менеджера.
    const byFreshness = byFreshnessOf(openDeals.filter(isOwn));
    const foreignByFreshness = byFreshnessOf(
        openDeals.filter(deal => !isOwn(deal)),
    );

    // Сделка плейсмента впереди «самой свежей»: бэк двигает по стадиям именно
    // её (приоритет launchDealId в init), и шапка обязана показывать ту же
    // сделку — иначе при двух открытых основных менеджер видит одну, а
    // закрывается другая. Владение её не гейтит: контекст выбрал сам менеджер.
    const currentId = Number(currentDealId ?? 0);
    const currentDeal = openDeals.find(deal => deal.id === currentId) ?? null;
    // Закрытая сделка контекста — кандидат в главные ТОЛЬКО когда своих
    // открытых нет, а чужие есть: переключаться нельзя, но шапка обязана
    // показывать ту сделку, из которой реально открылись.
    const closedCurrentDeal =
        mergedDeals.find(deal => deal.id === currentId && deal.closed) ?? null;
    const mainDeal =
        (currentDeal && isBaseSalesDeal(currentDeal) ? currentDeal : null) ??
        byFreshness.find(isBaseSalesDeal) ??
        currentDeal ??
        byFreshness[0] ??
        (foreignByFreshness.length ? closedCurrentDeal : null) ??
        null;

    const main = mainDeal
        ? dealItem(mainDeal)
        : (openLeads[0] && leadItem(openLeads[0])) || null;

    // Хинты о выборе главной: автопереключение со ЗАКРЫТОЙ сделки контекста
    // на свою открытую — и чужая открытая, на которую не переключились.
    // Закрытость контекста подтверждаем данными (плейсмент или граф), а не
    // отсутствием сделки в списке: граф закрытых по умолчанию не возит.
    const isContextClosed = currentDealClosed === true || !!closedCurrentDeal;
    const mainIsOwnOpenDeal = !!mainDeal && !mainDeal.closed && isOwn(mainDeal);
    let notice: RelationsBarNotice | null = null;
    if (
        mainDeal &&
        mainIsOwnOpenDeal &&
        currentId > 0 &&
        isContextClosed &&
        mainDeal.id !== currentId
    ) {
        notice = { kind: 'ownOpenSwitch', deal: mainDeal };
    } else if (!mainIsOwnOpenDeal) {
        // Сделку самого контекста чужой не объявляем: менеджер уже в ней.
        const foreignDeal =
            foreignByFreshness.find(deal => deal.id !== currentId) ?? null;
        if (foreignDeal) notice = { kind: 'foreignOpen', deal: foreignDeal };
    }

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
        notice,
    };
};
