import type { RelatedCrmDetails, RelatedDeal, RelatedLead } from '../model';
import { isBaseSalesDeal } from './deal-category';

/**
 * Связи для карточки дела — из двух уже загруженных источников.
 *
 * Источники разные по смыслу:
 * - ПРИВЯЗКИ ЗАДАЧИ (`boundDeals`, UF_CRM_TASK → D_id) — первоисточник
 *   «сделки этого дела»: по ним же считается отчёт. Старые сделки
 *   создавались без CRM-связей, и кроме привязки о них не знает никто.
 * - ГРАФ КЛИЕНТА (`details`, duplicates/details) — общая картина: все
 *   открытые сделки клиента по LEAD_ID/компании/pbx-связям.
 *
 * Отдельного запроса на карточку не делаем: оба источника уже в состоянии,
 * остаётся сопоставить — это чистая функция.
 */

/** Сделка карточки: privязанная может оказаться вне графа клиента. */
export type RelationDeal = RelatedDeal & {
    /**
     * Привязана к задаче, но в графе связей клиента отсутствует — скорее
     * всего создана без CRM-связей (старый flow или ошибка). Подсвечивается
     * в полосках как несоответствие.
     */
    isOutsideClientGraph?: boolean;
    /**
     * Привязана к самой задаче (первоисточник, по ней отчёт) — карточка
     * рисует её основной полоской, остальные уходят в миниатюру сбоку.
     */
    isTaskBound?: boolean;
};

export interface TaskRelation {
    /**
     * Открытые сделки для полосок стадий: привязанные к задаче первыми,
     * дальше остальные сделки клиента по свежести. Не больше
     * MAX_RELATION_DEALS. Пустой массив — сделок нет.
     */
    deals: RelationDeal[];
    /** Лид из привязок задачи — показывается, когда сделок нет. */
    lead: RelatedLead | null;
}

/**
 * Полосок в карточке помещается немного (фрейм-миниатюра): показываем самые
 * важные открытые сделки, остальное менеджер смотрит в секции «Сделки».
 */
export const MAX_RELATION_DEALS = 3;

export interface ResolveTaskRelationParams {
    details: RelatedCrmDetails | null;
    /** Загруженные по привязкам задач сделки (слайс taskDeals). */
    boundDeals: RelatedDeal[];
    dealIds: number[];
    leadIds: number[];
    /**
     * Показывать ли сделку воронки «ОП Основная» (sales_base). false —
     * в полосках остаются только сделки остальных воронок: презентации,
     * холодные. Скрытая основная освобождает место под лимитом.
     */
    withMainDeal?: boolean;
}

export const resolveTaskRelation = ({
    details,
    boundDeals,
    dealIds,
    leadIds,
    withMainDeal = true,
}: ResolveTaskRelationParams): TaskRelation => {
    // Закрытые отсекаем и здесь: по умолчанию бэк отдаёт открытые, но на
    // экране клиента есть переключатель includeClosed — полоски закрытых
    // сделок только путали бы («куда двигать то, что уже закрыто?»).
    const openDeals = details?.deals?.filter(deal => !deal.closed) ?? [];
    const graphDeals = withMainDeal
        ? openDeals
        : openDeals.filter(deal => !isBaseSalesDeal(deal));

    // Привязанные к задаче: версия из графа богаче (categoryTitle, портальный
    // цвет), поэтому предпочитаем её; привязку вне графа берём из портального
    // дозапроса и помечаем несоответствием — но только когда граф реально
    // загружен, иначе это не «вне графа», а «граф ещё не приехал».
    const attached: RelationDeal[] = [];
    for (const id of new Set(dealIds)) {
        // Ищем в НЕфильтрованных открытых: скрытая флагом основная сделка —
        // всё ещё «в графе», иначе она вернулась бы через boundDeals с ложной
        // меткой несоответствия.
        const fromGraph = openDeals.find(deal => deal.id === id);
        if (fromGraph) {
            if (withMainDeal || !isBaseSalesDeal(fromGraph)) {
                attached.push({ ...fromGraph, isTaskBound: true });
            }
            continue;
        }
        // Гейт основной действует и здесь: привязанным categoryCode
        // проставляет mapBoundDeal по слепку портала — без этого основная
        // из привязок вспыхивала бы, пока граф не приехал, а вне графа
        // не скрывалась бы вовсе.
        const bound = boundDeals.find(deal => deal.id === id && !deal.closed);
        if (bound && (withMainDeal || !isBaseSalesDeal(bound))) {
            attached.push({
                ...bound,
                isTaskBound: true,
                ...(details ? { isOutsideClientGraph: true } : {}),
            });
        }
    }

    const rest = graphDeals
        .filter(deal => !dealIds.includes(deal.id))
        .sort((a, b) => (b.dateCreate ?? '').localeCompare(a.dateCreate ?? ''));

    const lead =
        details?.leads?.find(item => leadIds.includes(item.id)) ?? null;

    return {
        deals: [...attached, ...rest].slice(0, MAX_RELATION_DEALS),
        lead,
    };
};
