import { API_METHOD } from "@workspace/api"

export type ALL_ENTITIES = Entity[]
enum ENTITY_QUANTITY {
    ENTITY = 'entity',
    ENTITIES = 'entities',
}
export type Entity = {
    id: number;
    item: {
        name: string;
        title: string;
        type: ENTITY_QUANTITY;
        get: {
            url: string;
            method: API_METHOD;
        };
    };
    items: {
        name: string;
        title: string;
        type: ENTITY_QUANTITY;
        get: {
            url: string;
            method: API_METHOD;
        };
    };
    relations: number[];
}

export const allEntities: Entity[] = [
    {
        id: 0,
        item: {
            name: 'timezones',
            title: 'Timezones',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/timezones',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'timezones',
            title: 'Timezones',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/timezones',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 1,
        item: {
            name: 'smarts',
            title: 'Smarts',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/smarts',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'smarts',
            title: 'Smarts',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/smarts',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 2,
        item: {
            name: 'portal',
            title: 'Portal',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/portal',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'portals',
            title: 'Portals',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/portal',
                method: API_METHOD.GET
            }
        },
        relations: [15, 16]
    },

    {
        id: 3,
        item: {
            name: 'measures',
            title: 'Measures',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/measures',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'measures',
            title: 'Measures',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/measures',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 4,
        item: {
            name: 'contracts',
            title: 'Contracts',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/contracts',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'contracts',
            title: 'Contracts',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/contracts',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 5,
        item: {
            name: 'client',
            title: 'Client',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/client',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'clients',
            title: 'Clients',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/client',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 6,
        item: {
            name: 'bx-rqs',
            title: 'Bx Rqs',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/bx-rqs',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'bx-rqs',
            title: 'Bx Rqs',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/bx-rqs',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 7,
        item: {
            name: 'btx-rpas',
            title: 'Btx Rpas',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-rpas',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-rpas',
            title: 'Btx Rpas',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-rpas',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 8,
        item: {
            name: 'btx-leads',
            title: 'Btx Leads',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-leads',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-leads',
            title: 'Btx Leads',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-leads',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 9,
        item: {
            name: 'btx-deals',
            title: 'Btx Deals',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-deals',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-deals',
            title: 'Btx Deals',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-deals',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 10,
        item: {
            name: 'btx-contacts',
            title: 'Btx Contacts',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-contacts',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-contacts',
            title: 'Btx Contacts',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-contacts',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 11,
        item: {
            name: 'btx-companies',
            title: 'Btx Companies',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-companies',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-companies',
            title: 'Btx Companies',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-companies',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 12,
        item: {
            name: 'btx-categories',
            title: 'Btx Categories',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/btx-categories',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'btx-categories',
            title: 'Btx Categories',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/btx-categories',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 13,
        item: {
            name: 'bitrix-fields',
            title: 'Bitrix Fields',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/bitrix-fields',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'bitrix-fields',
            title: 'Bitrix Fields',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/bitrix-fields',
                method: API_METHOD.GET
            }
        },
        relations: []
    },

    {
        id: 14,
        item: {
            name: 'bitrix-app',
            title: 'Bitrix App',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/bitrix-app',
                method: API_METHOD.GET
            }
        },
        items: {
            name: 'bitrix-apps',
            title: 'Bitrix Apps',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/bitrix-app',
                method: API_METHOD.GET
            }
        },
        relations: []
    }
];
