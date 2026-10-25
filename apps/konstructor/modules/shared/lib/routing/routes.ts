/**
 * Справочник маршрутов конструктора — единственное место, где записаны пути.
 * Схема экранов и сценарии — docs/routing.md.
 */
export enum ROUTE_KONSTRUCTOR {
    ENTRY = 'entry',
    START = 'start',
    FAVORITES = 'favorites',
    PROMOTIONS = 'promotions',
    VARIANTS = 'variants',
    PARAMS = 'params',
    COMPLECT = 'complect',
    PRICES = 'prices',
    DOCUMENT = 'document',
    SETTINGS = 'settings',
    REQUISITES = 'requisites',
}

export const KONSTRUCTOR_ROUTE_PATH: Record<ROUTE_KONSTRUCTOR, string> = {
    [ROUTE_KONSTRUCTOR.ENTRY]: '/',
    [ROUTE_KONSTRUCTOR.START]: '/start',
    [ROUTE_KONSTRUCTOR.FAVORITES]: '/favorites',
    [ROUTE_KONSTRUCTOR.PROMOTIONS]: '/promotions',
    [ROUTE_KONSTRUCTOR.VARIANTS]: '/variants',
    [ROUTE_KONSTRUCTOR.PARAMS]: '/params',
    [ROUTE_KONSTRUCTOR.COMPLECT]: '/complect',
    [ROUTE_KONSTRUCTOR.PRICES]: '/prices',
    [ROUTE_KONSTRUCTOR.DOCUMENT]: '/document',
    [ROUTE_KONSTRUCTOR.SETTINGS]: '/settings',
    [ROUTE_KONSTRUCTOR.REQUISITES]: '/requisites',
};

export type FlowRoute =
    | ROUTE_KONSTRUCTOR.PARAMS
    | ROUTE_KONSTRUCTOR.COMPLECT
    | ROUTE_KONSTRUCTOR.PRICES
    | ROUTE_KONSTRUCTOR.DOCUMENT;

export interface FlowStep {
    route: FlowRoute;
    label: string;
    /** Шаг открывается, только когда собран главный товар. */
    needsMainRow: boolean;
}

/** Шаги сборки в порядке прохождения (легаси GLOBAL → KONSTRUCTOR → PRODUCTS → DOCUMENT). */
export const FLOW_STEPS: FlowStep[] = [
    { route: ROUTE_KONSTRUCTOR.PARAMS, label: 'Параметры', needsMainRow: false },
    { route: ROUTE_KONSTRUCTOR.COMPLECT, label: 'Комплект', needsMainRow: true },
    { route: ROUTE_KONSTRUCTOR.PRICES, label: 'Цены', needsMainRow: true },
    { route: ROUTE_KONSTRUCTOR.DOCUMENT, label: 'Документ', needsMainRow: true },
];
