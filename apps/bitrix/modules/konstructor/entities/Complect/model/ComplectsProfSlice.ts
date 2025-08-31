import { createSlice } from '@reduxjs/toolkit';
import {
    Complect,
    ComplectFullTitlesEnum,
    ComplectNamesEnum,
    ComplectShortitlesEnum,
} from '../type/document-complect-type';

//TYPES
export type ComplectProfPlanState = typeof initialState;

export const initialState = {
    items: [
        {
            name: ComplectNamesEnum.ProfBuh,
            title: ComplectShortitlesEnum.ProfBuh,
            fullTitle: ComplectFullTitlesEnum.ProfBuh,
            shortTitle: ComplectShortitlesEnum.ProfBuh,

            tag: 'accountant',
            className: 'btn__accountant',
            number: 0,
            weight: 3.5,

            withConsalting: false,
            isChanging: false,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Большая библиотека бухгалтера и кадрового работника',
                'Энциклопедия. Формы правовых документов',
                'Пакет Энциклопедий решений для бухгалтера',
            ],

            ers: [],
            packetsEr: [0],
            ersInPacket: [0, 2, 4, 5, 6],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5],
            consalting: [0],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        } as Complect,

        {
            name: ComplectNamesEnum.ProfBuhgos,
            title: ComplectShortitlesEnum.ProfBuhgos,
            fullTitle: ComplectFullTitlesEnum.ProfBuhgos,
            shortTitle: ComplectShortitlesEnum.ProfBuhgos,
            tag: 'budget',
            className: 'btn__budget',
            number: 1,
            weight: 4,
            withConsalting: false,
            isChanging: false,
            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Большая библиотека бухгалтера и кадрового работника',
                'Энциклопедия. Формы правовых документов',
                'Энциклопедия решений.Проверки организаций и предпринимателей',
            ],

            ers: [0],
            packetsEr: [1],
            ersInPacket: [1, 3, 4, 5, 6],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5],
            consalting: [0],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
        },

        {
            name: ComplectNamesEnum.ProfUr,
            title: ComplectShortitlesEnum.ProfUr,
            fullTitle: ComplectFullTitlesEnum.ProfUr,
            shortTitle: ComplectShortitlesEnum.ProfUr,

            tag: 'lawyer',
            className: 'btn__lawyer',

            number: 2,

            weight: 9,
            withConsalting: false,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Отраслевое законодательство',

                'Практика высших судебных органов',
                'Практика арбитражных судов округов',
                'Практика арбитражных апелляционных судов округов',
                'Практика судов общей юрисдикции',
                'Энциклопедия судебной практики. Правовые позиции судов',

                'Большая библиотека юриста',

                'Энциклопедия. Формы правовых документов',
            ],

            ers: [],
            packetsEr: [2],
            ersInPacket: [0, 3, 4, 6, 7],

            lt: [0, 1],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 11],
            consalting: [0],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },
        {
            name: ComplectNamesEnum.ProfExpert,
            title: ComplectShortitlesEnum.ProfExpert,
            fullTitle: ComplectFullTitlesEnum.ProfExpert,
            shortTitle: ComplectShortitlesEnum.ProfExpert,

            tag: 'expert',
            className: 'btn__expert',

            number: 3,

            weight: 5,
            withConsalting: false,
            isChanging: false,

            filling: [
                'Отраслевое законодательство',
                'Справочник промышленника',
                'Справочник нормативно-технической документации по строительству',
                // 'Справочник по охране труда',
                // 'Справочник по техническому регулированию и стандартизации',
                'Справочник промышленника. Дополнительные материалы',
                'Справочник нормативно-технической документации по строительству. Дополнительные материалы',
            ],

            ers: [],
            packetsEr: [],
            ersInPacket: [],

            lt: [1, 3],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 5],
            consalting: [0],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },

        {
            name: ComplectNamesEnum.ProfOffice,
            title: ComplectShortitlesEnum.ProfOffice,
            fullTitle: ComplectFullTitlesEnum.ProfOffice,
            shortTitle: ComplectShortitlesEnum.ProfOffice,

            tag: 'office',
            className: 'btn__office',

            number: 4,

            weight: 11,
            withConsalting: false,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Отраслевое законодательство',

                'Практика высших судебных органов',
                'Практика арбитражных судов округов',
                'Практика арбитражных апелляционных судов округов',
                'Практика судов общей юрисдикции',
                'Энциклопедия судебной практики. Правовые позиции судов',

                'Большая библиотека юриста',
                'Большая библиотека бухгалтера и кадрового работника',

                'Пакет Энциклопедий решений для юриста',
                'Пакет Энциклопедий решений для бухгалтера',

                'Энциклопедия. Формы правовых документов',
            ],

            ers: [],
            packetsEr: [0, 2],
            ersInPacket: [0, 2, 4, 5, 6, 3, 7],

            lt: [0, 1, 8, 9, 10],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7],
            consalting: [0],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },
        {
            name: ComplectNamesEnum.ProfExZak,
            title: ComplectShortitlesEnum.ProfExZak,
            fullTitle: ComplectFullTitlesEnum.ProfExZak,
            shortTitle: ComplectShortitlesEnum.ProfExZak,

            tag: 'buh',
            className: 'btn__budget',

            number: 18,

            weight: 6,
            withConsalting: true,
            isChanging: true,
            noChanged: [
                'Законодательство России',
                'Региональное законодательство',
                'Решения Федеральной антимонопольной службы',
                'Энциклопедия судебной практики. Правовые позиции судов',
                'Энциклопедия. Формы правовых документов',
            ],
            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Решения Федеральной антимонопольной службы',
                'Практика высших судебных органов',
                'Практика арбитражных судов округов',
                'Энциклопедия судебной практики. Правовые позиции судов',
                'Энциклопедия. Формы правовых документов',
            ],

            ers: [6, 3],
            packetsEr: [],
            ersInPacket: [],

            lt: [2, 11, 12, 8, 1],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],
            consalting: [0, 1],
            consaltingProduct: [],
            type: 'prof',
            withStar: true,
            star: [0],
            regions: [],
        },
        {
            name: ComplectNamesEnum.ProfGlavbuh,
            title: ComplectShortitlesEnum.ProfGlavbuh,
            fullTitle: ComplectFullTitlesEnum.ProfGlavbuh,
            shortTitle: ComplectShortitlesEnum.ProfGlavbuh,

            tag: 'bigAccountant',
            className: 'btn__accountant-big',

            number: 5,
            weight: 7,

            withConsalting: true,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',

                'Практика высших судебных органов',
                'Практика арбитражных судов округов',

                'Большая библиотека бухгалтера и кадрового работника',

                'Энциклопедия. Законодательство в схемах',
                'Энциклопедия. Формы правовых документов',
            ],

            ers: [3, 7],
            packetsEr: [0],
            ersInPacket: [0, 2, 4, 5, 6],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],

            consalting: [0, 1],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },

        {
            name: ComplectNamesEnum.ProfGlavbuhgos,
            title: ComplectShortitlesEnum.ProfGlavbuhgos,
            fullTitle: ComplectFullTitlesEnum.ProfGlavbuhgos,
            shortTitle: ComplectShortitlesEnum.ProfGlavbuhgos,

            tag: 'bigBudget',
            className: 'btn__budget-big',
            number: 6,
            weight: 8,

            withConsalting: true,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Отраслевое законодательство',

                'Практика высших судебных органов',
                'Практика арбитражных судов округов',

                'Большая библиотека бухгалтера и кадрового работника',

                'Энциклопедия. Законодательство в схемах',
                'Энциклопедия. Формы правовых документов',

                'Энциклопедия решений. Проверки организаций и предпринимателей',
                'Энциклопедия решений. Корпоративное право',
                'Пакет Энциклопедий решений для бухгалтера госсектора',
            ],

            ers: [0, 7],
            packetsEr: [1],
            ersInPacket: [1, 3, 4, 5, 6],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],
            consalting: [0, 1],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },
        {
            name: ComplectNamesEnum.ProfPred,
            title: ComplectShortitlesEnum.ProfPred,
            fullTitle: ComplectFullTitlesEnum.ProfPred,
            shortTitle: ComplectShortitlesEnum.ProfPred,
            tag: 'company',
            className: 'btn__company',

            number: 7,

            weight: 12.5,
            withConsalting: true,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Отраслевое законодательство',
                'Практика высших судебных органов',
                'Практика арбитражных судов округов',
                'Практика арбитражных апелляционных судов округов',
                'Практика судов общей юрисдикции',
                'Энциклопедия судебной практики. Правовые позиции судов',

                'Большая библиотека юриста',
                'Большая библиотека бухгалтера и кадрового работника',

                'Энциклопедия. Формы правовых документов',
            ],
            currentFilling: '',

            ers: [0, 2, 3, 4, 5, 6, 7],
            packetsEr: [],
            ersInPacket: [],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],
            consalting: [0, 1],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },

        {
            name: ComplectNamesEnum.ProfPredPro,
            title: ComplectShortitlesEnum.ProfPredPro,
            fullTitle: ComplectFullTitlesEnum.ProfPredPro,
            shortTitle: ComplectShortitlesEnum.ProfPredPro,

            tag: 'companyPro',
            className: 'btn__company-pro',

            number: 8,

            weight: 15.5,
            withConsalting: true,
            isChanging: true,

            filling: [
                'Законодательство России',
                'Региональное законодательство',
                'Отраслевое законодательство',
                'Справочник промышленника',
                'Практика высших судебных органов',
                'Практика арбитражных судов округов',
                'Практика арбитражных апелляционных судов округов',
                'Практика судов общей юрисдикции',
                'Энциклопедия судебной практики. Правовые позиции судов',
                'Большая библиотека юриста',
                'Большая библиотека бухгалтера и кадрового работника',
                'Энциклопедия. Формы правовых документов',
                'Энциклопедия решений.Проверки организаций и предпринимателей',
                'Энциклопедия решений.Хозяйственные ситуации',
                'Энциклопедия решений.Госзакупки',
                'Энциклопедия решений.Трудовые отношения, кадры',
                'Энциклопедия решений.Договоры и иные сделки',
                'Энциклопедия решений.Корпоративное право',
                'Энциклопедия решений.Налоги и взносы',
            ],

            ers: [0, 2, 3, 4, 5, 6, 7],
            packetsEr: [],
            ersInPacket: [],

            lt: [1, 8],
            ltInPacket: [],

            freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],
            consalting: [0, 1],
            consaltingProduct: [],
            type: 'prof',
            withStar: false,
            star: [],
            regions: [],
        },
    ] as Array<Complect>,
};

const complectProfSlice = createSlice({
    name: 'complectProf',
    initialState,
    reducers: {},
});

export const complectProfReducer = complectProfSlice.reducer;

// Экспорт actions
export const complectProfActions = complectProfSlice.actions;
