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
];


// Раздел «Маркетплейс» (приложение «Менеджер Гарант»): url — ПОЛНЫЕ пути
// (baseUrl в use-current-side-bar для маркетплейса пустой, т.к. «Клиенты»
// живут на /client вне префикса /marketplace).
export const marketplaceEntities: Entity[] = [
    {
        id: 30,
        item: {
            name: 'marketplace-applications',
            title: 'Заявки',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/marketplace/applications',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 35,
        item: {
            name: 'marketplace-invites',
            title: 'Коды подключения',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/marketplace/invites',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 31,
        item: {
            name: 'marketplace-installs',
            title: 'Установки',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/marketplace/installs',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 32,
        item: {
            name: 'client',
            title: 'Клиенты',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/client',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 33,
        item: {
            name: 'marketplace-secrets',
            title: 'Секреты приложений',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/marketplace/secrets',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 34,
        item: {
            name: 'marketplace-events',
            title: 'Журнал событий',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/marketplace/events',
                method: API_METHOD.GET
            }
        },
    },
];


// Раздел «База знаний AI (RAG)»: url — полный путь (baseUrl пустой).
export const aiKnowledgeEntities: Entity[] = [
    {
        id: 40,
        item: {
            name: 'ai-knowledge',
            title: 'Документы',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/ai-knowledge',
                method: API_METHOD.GET
            }
        },
    },
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
];



export const portalPbxEntities: Entity[] = [
    {
        id: 0,
        item: {
            name: 'company',
            title: 'Компания',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/company',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 1,
        item: {
            name: 'deal',
            title: 'Сделка',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/deal',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 2,
        item: {
            name: 'user',
            title: 'Пользователь',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/user',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 3,
        item: {
            name: 'task',
            title: 'Задача',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/task',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 4,
        item: {
            name: 'departament',
            title: 'Отдел',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/departament',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 5,
        item: {
            name: 'group',
            title: 'Группа звонков',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/group',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 6,
        item: {
            name: 'smart',
            title: 'Смарт-процессы',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/smart',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 7,
        item: {
            name: 'rpa',
            title: 'RPA',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/rpa',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 8,
        item: {
            name: 'lead',
            title: 'Лид',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/lead',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 9,
        item: {
            name: 'contact',
            title: 'Контакт',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/contact',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 10,
        item: {
            name: 'rq',
            title: 'Реквизиты',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/rq',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 11,
        item: {
            name: 'list',
            title: 'Списки',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/list',
                method: API_METHOD.GET
            }
        },
    },
];


export const portalKeysEntities: Entity[] = [
    {
        id: 0,
        item: {
            name: 'keys',
            title: 'Ключи портала',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/keys',
                method: API_METHOD.GET
            }
        },
    },
];


export const portalProviderEntities: Entity[] = [
    {
        id: 0,
        item: {
            name: 'provider',
            title: 'Поставщики',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/provider',
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
    {
        id: 4,
        item: {
            name: 'contract',
            title: 'Виды договоров',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/contract',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 5,
        item: {
            name: 'measure',
            title: 'Единицы измерения',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/measure',
                method: API_METHOD.GET
            }
        },
    },
]


export const portalKonstructorEntities: Entity[] = [
    {
        id: 0,
        item: {
            name: 'contract',
            title: 'Договоры',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/contract',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 1,
        item: {
            name: 'measure',
            title: 'Единицы измерения',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/measure',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 2,
        item: {
            name: 'template',
            title: 'Шаблоны',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/template',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 3,
        item: {
            name: 'field',
            title: 'Поля',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/field',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 4,
        item: {
            name: 'counter',
            title: 'Счётчики',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/counter',
                method: API_METHOD.GET
            }
        },
    },
    {
        id: 5,
        item: {
            name: 'numerator',
            title: 'Нумераторы',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/numerator',
                method: API_METHOD.GET
            }
        },
    },
]
