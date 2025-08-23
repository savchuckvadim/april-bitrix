export enum ROUTE_EVENT {
  LIST = "list",
  ITEM = "item",
  FINISH = "finish",
}
export enum ROUTE_EVENT_NAME {
  LIST = "Список Событий",
  ITEM = "Событие",
  FINISH = "Финиш",
}
export enum ROUTE_DOCUMENT {
  COMPLECT_SETTINGS = "complectSettings",
  COMPLECT = "complect",
  PRODUCTS = "products",
  TEMPLATE = "template",
  DOCUMENT_SETTINGS = "document",
}

export enum ROUTE_DOCUMENT_NAME {
  COMPLECT_SETTINGS = "Глобальные натройки комплекта",
  COMPLECT = "Конструктор",
  PRODUCTS = "Цены и сравнение комплектов",
  TEMPLATE = "Выбор Шаблона",
  DOCUMENT_SETTINGS = "Документ",
}

export interface RouteEvent {
  id: number;
  name: ROUTE_EVENT_NAME;
  route: ROUTE_EVENT;
}

export interface RouteDocument {
  id: number;
  name: ROUTE_DOCUMENT_NAME;
  route: ROUTE_DOCUMENT;
}

// export type RouterStateRoutes = {
//     [APP_TYPE.EVENT]: {
//         [ROUTE_EVENT.ITEM]: RouteEvent
//         [ROUTE_EVENT.LIST]: RouteEvent
//     },
//     [APP_TYPE.DOCUMENT]: {
//         [ROUTE_DOCUMENT.COMPLECT_SETTINGS]: RouteDocument
//         [ROUTE_DOCUMENT.COMPLECT]: RouteDocument
//         [ROUTE_DOCUMENT.PRODUCTS]: RouteDocument
//         [ROUTE_DOCUMENT.DOCUMENT_SETTINGS]: RouteDocument

//     }
// }
export type EventRoutes = {
  [ROUTE_EVENT.ITEM]: RouteEvent;
  [ROUTE_EVENT.LIST]: RouteEvent;
};
export type EventRouterState = {
  routes: EventRoutes;
  current: RouteEvent;
  previous: RouteEvent | null;
};

export type DocumentRoutes = {
  [ROUTE_DOCUMENT.COMPLECT_SETTINGS]: RouteDocument;
  [ROUTE_DOCUMENT.COMPLECT]: RouteDocument;
  [ROUTE_DOCUMENT.PRODUCTS]: RouteDocument;
  [ROUTE_DOCUMENT.TEMPLATE]: RouteDocument;
  [ROUTE_DOCUMENT.DOCUMENT_SETTINGS]: RouteDocument;
};
export type DocumentRouterState = {
  routes: DocumentRoutes;
  current: RouteDocument;
  previous: RouteDocument | null;
};

export type Route = RouteEvent | RouteDocument;
