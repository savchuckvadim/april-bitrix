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

}

export const clientEntities: Entity[] = [


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
        }
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

    }
];


export const portalEntities: Entity[] = [

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

    }
];

export const portalBitrixEntities: Entity[] = [
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

    },


];


export const garantEntities: Entity[] = [


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

    },
    {
        id: 4,
        item: {
            name: 'regions',
            title: 'Regions',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/regions',
                method: API_METHOD.GET
            }
        },

    },
    {
        id: 4,
        item: {
            name: 'supplies',
            title: 'Виды поставок',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/supplies',
                method: API_METHOD.GET
            }
        },

    },
    {
        id: 4,
        item: {
            name: 'prof-prices',
            title: 'Prof Prices',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/prof-prices',
                method: API_METHOD.GET
            }
        },

    },

    {
        id: 4,
        item: {
            name: 'complect',
            title: 'Complect',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/complect',
                method: API_METHOD.GET
            }
        },

    },
    {
        id: 4,
        item: {
            name: 'packages',
            title: 'Packages',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/packages',
                method: API_METHOD.GET
            }
        },

    },

    {
        id: 4,
        item: {
            name: 'infoblocks',
            title: 'Info Blocks',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/infoblocks',
                method: API_METHOD.GET
            }
        },

    },
    {
        id: 4,
        item: {
            name: 'infogroups',
            title: 'Info Groups',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/info-groups',
                method: API_METHOD.GET
            }
        },

    },

];


export const portalGarantEntities: Entity[] = [


    {
        id: 3,
        item: {
            name: 'measures',
            title: 'Portal Measures',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/measures',
                method: API_METHOD.GET
            }
        },

    },

    {
        id: 4,
        item: {
            name: 'portal-contracts',
            title: 'Portal Contracts',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/contracts',
                method: API_METHOD.GET
            }
        },

    },

    {
        id: 4,
        item: {
            name: 'portal-regions',
            title: 'Portal Regions',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/regions',
                method: API_METHOD.GET
            }
        },

    },


];



export const portalStatisticstEntities: Entity[] = [


    {
        id: 3,
        item: {
            name: 'transcription',
            title: 'Transcription',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/transcription',
                method: API_METHOD.GET
            }
        },

    },
]


export const konstructorEntities: Entity[] = [
    {
        id: 3,
        item: {
            name: 'Шаблоны Word КП',
            title: 'Шаблоны Word КП',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/word-template',
                method: API_METHOD.GET
            }
        },

    },
    {
        id: 3,
        item: {
            name: 'Шаблоны PDF КП',
            title: 'Шаблоны PDF КП',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/pdf-template',
                method: API_METHOD.GET
            }
        },
    },
]
