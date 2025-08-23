// import { RESET } from "../reset/reset-reducer"

// const initialState = {
//     // currentComplect: null,
//     complects: [
//         {
//             name: 'classic',
//             title: 'Классик',
//             fullTitle: 'Гарант-Классик',
//             shortTitle: '',

//             'isChanging': true,

//             weight: 1,
//             'className': 'btn__universal',
//             number: 9,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },
//         {
//             name: 'classicPlus',
//             title: 'Классик+',
//             fullTitle: 'Гарант-Классик+',
//             shortTitle: '',
//             withStar: false,
//             star:[],

//             'isChanging': true,
//             weight: 1.5,
//             'className': 'btn__universal',
//             number: 10,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },
//         {
//             name: 'un',
//             title: 'Универсал',
//             fullTitle: 'Гарант-Универсал',
//             shortTitle: '',

//             'isChanging': true,
//             weight: 2,
//             'className': 'btn__universal',
//             number: 11,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],

//         },
//         {
//             name: 'unlus',
//             title: 'Универсал+',
//             fullTitle: 'Гарант-Универсал+',
//             shortTitle: '',

//             'isChanging': true,
//             weight: 3,
//             className: 'btn__universal',
//             number: 12,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },
//         {
//             name: 'professional',
//             title: 'Профессионал',
//             fullTitle: 'Гарант-Профессионал',
//             shortTitle: '',

//             'isChanging': true,
//             weight: 4,
//             className: 'btn__universal',
//             number: 13,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },
//         {
//              name: 'master',
//             title: 'Мастер',
//             fullTitle: 'Гарант-Мастер',
//             shortTitle: '',
//             withStar: false,
//             star:[],
//             regions:[],

//             'isChanging': true,
//             weight: 6,
//             className: 'btn__universal',
//             number: 14,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },
//         {
//             name: 'analitik',
//             title: 'Аналитик',
//             fullTitle: 'Гарант-Аналитик',
//             shortTitle: '',
//             withStar: false,
//             star:[],
//             regions:[],

//             'isChanging': true,
//             weight: 9,
//             className: 'btn__universal',
//             number: 15,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//         },
//         {
//             name: 'analitikPlus',
//             title: 'Аналитик+',
//             fullTitle: 'Гарант-Аналитик+',
//             shortTitle: '',
//             withStar: false,
//             star:[],
//             regions:[],

//             'isChanging': true,
//             weight: 12,
//             className: 'btn__universal',
//             number: 16,
//             withConsalting: false,
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//         },
//         {
//             name: 'maximum',
//             title: 'Максимум',
//             fullTitle: 'Гарант-Максимум',
//             shortTitle: '',
//             withStar: false,
//             star:[],
//             regions:[],

//             'isChanging': true,
//             weight: 23,
//             className: 'btn__universal',
//             number: 17,
//             withConsalting: false,
//             filling: [
//                 'Законодательство России',
//                 'Региональное законодательство',
//                 'Отраслевое законодательство',
//                 'Проекты законов',
//                 'Международное право',
//                 // 'ГОСТы России',
//                 'Решения Федеральной антимонопольной службы',
//                 'Справочник промышленника',
//                 'Справочник по охране труда',
//                 'Справочник по техническому регулированию и стандартизации',
//                 'Практика высших судебных органов',
//                 'Практика арбитражных судов округов',
//                 'Практика арбитражных апелляционных судов округов',
//                 'Практика судов общей юрисдикции',
//                 'Энциклопедия судебной практики. Правовые позиции судов',
//                 'Большая библиотека юриста',
//                 'Большая библиотека бухгалтера и кадрового работника',
//                 'Толковый словарь «Бизнес и право»',

//                 'Энциклопедия. Законодательство в схемах',
//                 'Энциклопедия. Формы правовых документов',
//                 'ГАРАНТ-Инфарм',
//                 'Справочник нормативно-технической документации по строительству',
//                 'Справочник промышленника',
//                 'Справочник по охране труда',
//                 'Энциклопедия решений.Проверки организаций и предпринимателей',
//                 'Энциклопедия решений.Хозяйственные ситуации',
//                 'Энциклопедия решений.Госзакупки',
//                 'Энциклопедия решений.Трудовые отношения, кадры',
//                 'Энциклопедия решений.Договоры и иные сделки',
//                 'Энциклопедия решений.Корпоративное право',
//                 'Энциклопедия решений.Налоги и взносы',
//                 'Конструктор правовых документов',
//                 'Интернет-Семинары',
//                 'Судебная практика: приложение к консультационным блокам',
//                 'Онлайн-архив «Практика арбитражных судов первой инстанции»',
//                 'Большая домашняя правовая энциклопедия',
//                 'Архивы ГАРАНТа. Россия',
//                 'Правовой консалтинг. Премиум: База знаний службы Правового консалтинга',
//                 'ГАРАНТ Консалтинг: нормативные акты и судебная практика',

//             ],

//             packetsEr: [],
//             ersInPacket: [],
//             ers: [0, 1, 2, 3, 4, 5, 6, 7],

//             lt: [],
//             ltInPacket: [],

//             currentStatusInputComplectName: true,
//             freeBlocks: [0, 1, 2, 3, 4, 5, 6, 7, 8],
//             consalting: [0],
//             consaltingProduct: [],
//             type: 'universal',
//             withStar: false,
//             star:[],
//             regions:[],
//         },

//     ],
//     universalDefaultComplect: {

//         name: 'default',
//         title: 'Универсальный комплект',
//         fullTitle: 'Универсальный комплект',
//         shortTitle: '',

//         'title': '',
//         'isChanging': true,
//         'tag': 'universalComplect',
//         'className': 'btn__universal',

//         'number': 9,

//         'weight': 0,
//         withConsalting: false,
//         'filling': [
//             'Законодательство России',
//             'Региональное законодательство',
//         ],

//         'packetsEr': [],
//         'ersInPacket': [],
//         'ers': [],

//         'lt': [],
//         'ltInPacket': [],

//         'freeBlocks': [0, 1, 2, 5],
//         'consalting': [0],
//         consaltingProduct: [],
//         type: 'universal',
//         withStar: false,
//         star: [],
//         regions:[],
//     },
// }
// //AC
// // export const setCurrentUniversalComplect = (currentComplectIndex) => ({ type: SET_CURRENT_UNIVERSAL_COMPLECT, currentComplectIndex })

// //REDUCER
// const universals = (state = initialState, action) => {

//     switch (action.type) {

//         // case SET_CURRENT_UNIVERSAL_COMPLECT:
//         //     return { ...state, currentComplect: state.complects[action.currentComplectIndex] };

//         case RESET:
//             let universalComplectObjResult = { ...state.universalComplectObj }
//             universalComplectObjResult.filling = [
//                 'Законодательство России',
//                 'Региональное законодательство',
//             ]
//             return { ...state, universalComplectObj: universalComplectObjResult }
//         default:
//             return state;
//     }
// }

// export default universals
