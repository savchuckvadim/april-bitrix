/**
 * Автоматически сгенерированный файл
 * Не редактировать вручную!
 * Используется для навигации и генерации роутов
 */

export interface EntitySummaryItem {
    name: string;
    title: string;
    route: string;
    parent?: string;
    children?: string[];
}

export const entitySummary: EntitySummaryItem[] = [
  {
    "name": "timezones",
    "title": "Timezones",
    "route": "/timezones"
  },
  {
    "name": "smarts",
    "title": "Smarts",
    "route": "/smarts"
  },
  {
    "name": "portal",
    "title": "Portal",
    "route": "/portal",
    "children": [
      "portal-measures",
      "portal-contracts"
    ]
  },
  {
    "name": "measures",
    "title": "Measures",
    "route": "/measures"
  },
  {
    "name": "contracts",
    "title": "Contracts",
    "route": "/contracts"
  },
  {
    "name": "client",
    "title": "Client",
    "route": "/client"
  },
  {
    "name": "bx-rqs",
    "title": "Bx Rqs",
    "route": "/bx-rqs"
  },
  {
    "name": "btx-rpas",
    "title": "Btx Rpas",
    "route": "/btx-rpas"
  },
  {
    "name": "btx-leads",
    "title": "Btx Leads",
    "route": "/btx-leads"
  },
  {
    "name": "btx-deals",
    "title": "Btx Deals",
    "route": "/btx-deals"
  },
  {
    "name": "btx-contacts",
    "title": "Btx Contacts",
    "route": "/btx-contacts"
  },
  {
    "name": "btx-companies",
    "title": "Btx Companies",
    "route": "/btx-companies"
  },
  {
    "name": "btx-categories",
    "title": "Btx Categories",
    "route": "/btx-categories"
  },
  {
    "name": "bitrix-fields",
    "title": "Bitrix Fields",
    "route": "/bitrix-fields"
  },
  {
    "name": "bitrix-app",
    "title": "Bitrix App",
    "route": "/bitrix-app"
  },
  {
    "name": "portal-measures",
    "title": "Portal Measures",
    "route": "/portal/:portalId/portal-measures",
    "parent": "portal"
  },
  {
    "name": "portal-contracts",
    "title": "Portal Contracts",
    "route": "/portal/:portalId/portal-contracts",
    "parent": "portal"
  }
];

export const rootEntities = entitySummary.filter((e) => !e.parent);

export const getEntityByRoute = (route: string) => {
    return entitySummary.find((e) => e.route === route);
};

export const getChildrenEntities = (parentName: string) => {
    return entitySummary.filter((e) => e.parent === parentName);
};
