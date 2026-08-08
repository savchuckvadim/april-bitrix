import type { ClientContext } from '@/modules/app/lib/utills/app-state-util';
import { EV_PLAN_CODE } from '../type/event-plan-type';

/**
 * Что можно планировать в каком контексте клиента. Данные, не логика.
 *
 * Решение владельца (2026-08-07):
 * - компания — всё;
 * - сделка без компании — Звонок + Презентация + Решение (Оплата и Поставка
 *   требуют компанию: реквизиты, счёт);
 * - лид — только Звонок;
 * - неизвестный контекст (бут, пустая карточка звонка) — как лид, строже некуда.
 *
 * ТМЦ — отдельное измерение: итог = ПЕРЕСЕЧЕНИЕ правил (ТМЦ на сделке без
 * компании = Звонок + Презентация), а не победа одной из веток по порядку.
 *
 * TODO(portal-config): источником этих наборов станет портальный конфиг
 * («что можно без компании») — переезжает вместе с TODO(migration)
 * в app/consts/domain-config.ts. Бэк типы пока не энфорсит — фронт-гейт
 * единственный.
 */
export const PLAN_ALLOWED_BY_CONTEXT: Record<ClientContext, EV_PLAN_CODE[]> = {
    company: [
        EV_PLAN_CODE.WARM,
        EV_PLAN_CODE.PRESENTATION,
        EV_PLAN_CODE.HOT,
        EV_PLAN_CODE.PAY,
        EV_PLAN_CODE.SUPPLY,
    ],
    dealNoCompany: [
        EV_PLAN_CODE.WARM,
        EV_PLAN_CODE.PRESENTATION,
        EV_PLAN_CODE.HOT,
    ],
    lead: [EV_PLAN_CODE.WARM],
    unknown: [EV_PLAN_CODE.WARM],
};

/** ТМЦ планирует только звонок и презентацию — в любом контексте. */
export const PLAN_ALLOWED_TMC: EV_PLAN_CODE[] = [
    EV_PLAN_CODE.WARM,
    EV_PLAN_CODE.PRESENTATION,
];

/**
 * Клиенту уже продали: открытых сделок нет, есть недавняя успешная.
 *
 * По умолчанию оставляем только «Поставку» — тип, придуманный ровно для
 * звонков ПОСЛЕ продажи: он не создаёт новую сделку и не идёт в KPI как
 * новый цикл продажи. Иначе звонок «по решению» после успеха заводил бы
 * вторую сделку в той же воронке и удваивал продажи в отчётности.
 *
 * Ограничение мягкое: менеджер может раскрыть полный список кнопкой —
 * бывает, что клиент действительно начинает новый цикл покупки.
 */
export const PLAN_ALLOWED_AFTER_SALE: EV_PLAN_CODE[] = [EV_PLAN_CODE.SUPPLY];

export interface PlanRulesInput {
    context: ClientContext;
    isTmc: boolean;
    /** Все сделки клиента закрыты, последняя — успешная продажа. */
    isAfterSale?: boolean;
    /** Менеджер сам раскрыл полный список типов. */
    isAllTypesShown?: boolean;
}

/** Итоговый набор кодов: пересечение применимых правил. */
export const getAllowedPlanCodes = ({
    context,
    isTmc,
    isAfterSale = false,
    isAllTypesShown = false,
}: PlanRulesInput): EV_PLAN_CODE[] => {
    const base = PLAN_ALLOWED_BY_CONTEXT[context];
    const byTmc = isTmc
        ? base.filter(code => PLAN_ALLOWED_TMC.includes(code))
        : base;

    if (!isAfterSale || isAllTypesShown) return byTmc;

    const afterSale = byTmc.filter(code =>
        PLAN_ALLOWED_AFTER_SALE.includes(code),
    );
    // «Поставки» может не быть в наборе контекста (лид, ТМЦ) — тогда
    // ограничивать нечем, оставляем то, что разрешено контекстом.
    return afterSale.length ? afterSale : byTmc;
};
