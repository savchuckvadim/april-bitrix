// import { createSlice, PayloadAction } from "@reduxjs/toolkit"
// import { v4 as uuidv4 } from "uuid";
// import { canDropBlock, getNewPage } from "../lib/state-utils/block-state.util";
// import { EOfferBlockType, IOfferBlock } from "@/modules/entities/offer-template-block/type/offer-template-block.type";
// import { IOfferTemplateBlock } from "@/modules/entities/offer-template-block/type/offer-template-block.type";

// export interface OfferPdfSettingsState {
//     current: OfferPdfSetting;
//     items: OfferPdfSetting[];
//     editeble: IOfferTemplateBlock | null;
//     titlePositions: typeof titlePositions
// }
// export type BlockPostions = typeof titlePositions
// export type BlockPostion = typeof titlePositions[0]
// export interface OfferPdfSetting {
//     id: string;
//     name: string;
//     style: any;
//     font: OfferPdfFont;
//     pages: OfferPdfPage[];
//     colors: OfferPdfColors

// }
// export interface OfferPdfColors{
//     text: {
//         code: 'text',
//         value: string;
//         name: 'Текст'
//     };
//     background: {
//         code: 'background',
//         value: string;
//         name: 'Фон'
//     };
//     // border: {
//     //     code: 'border',
//     //     value: string;
//     //     name: 'Граница'
//     // };
//     accent: {
//         code: 'accent',
//         value: string;
//         name: 'Заголовки'
//     };
//     accentText: {
//         code: 'accentText',
//         value: string;
//         name: 'Акцентный текст'
//     };
//     // base: {
//     //     code: 'base',
//     //     value: string;
//     //     name: 'Фирменный цвет'
//     // };
// }
// export interface OfferPdfPage {
//     id: string;
//     order: number;
//     type: 'letter' | 'description' | 'infoblocks' | 'price';
//     name: string;
//     blocks: Array<IOfferBlock<keyof typeof EOfferBlockType>>;
// }
// // export type OfferPdfBlock = typeof blocks[keyof typeof blocks];
// export type OfferPdfFont = { id: number, label: string, value: string };

// const titlePositions = [
//     {
//         id: 0,
//         name: 'Слева сверху',
//         left: 0,
//         top: 0,
//         right: 0,
//         bottom: 0,
//         isActive: true,
//         style: 'text' as 'text' | 'border' | 'background'
//     },
//     {
//         id: 1,
//         name: 'Слева снизу',
//         left: 1,
//         top: 0,
//         right: 0,
//         bottom: 1,
//         isActive: true,
//         style: 'text' as 'text' | 'border' | 'background'
//     },
//     {
//         id: 2,
//         name: 'Справа сверху',
//         left: 0,
//         top: 1,
//         right: 1,
//         bottom: 0,
//         isActive: true,
//         style: 'text' as 'text' | 'border' | 'background'
//     },
//     {
//         id: 3,
//         name: 'Справа снизу',
//         left: 0,
//         top: 0,
//         right: 1,
//         bottom: 1,
//         isActive: true,
//         style: 'text' as 'text' | 'border' | 'background'
//     },
//     {
//         id: 4,
//         name: 'По центру',
//         left: "50%",
//         top: "50%",
//         isActive: true,
//         style: 'text' as 'text' | 'border' | 'background'
//     },

// ]

// const current: OfferPdfSetting = {
//     id: '0',
//     name: 'Новый шаблон',
//     style: {},
//     font: { id: 20, label: 'Geist', value: 'Geist, serif' } as OfferPdfFont,
//     pages: [],
//     colors: {
//         // base: {
//         //     code: 'base',
//         //     value: '#000000',
//         //     name: 'Фирменный цвет'
//         // },
//         text: {
//             code: 'text',
//             value: '#000000',
//             name: 'Текст'
//         },
//         background: {
//             code: 'background',
//             value: '#ffffff',
//             name: 'Фон'
//         },
//         // border: {
//         //     code: 'border',
//         //     value: '#000000',
//         //     name: 'Граница'
//         // },
//         accent: {
//             code: 'accent',
//             value: '#3d3af6',
//             name: 'Заголовки'
//         },
//         accentText: {
//             code: 'accentText',
//             value: '#ff0000',
//             name: 'Акцентный текст'
//         },
//     }
// }

// const initialState = {
//     current: current,
//     // items: [current],
//     // editeble: null as null | IOfferTemplateBlock,
//     titlePositions: titlePositions,

// } as OfferPdfSettingsState

// export const offerPdfSettingsSlice = createSlice({
//     name: 'offerPdfSettings',
//     initialState,
//     reducers: {
//         setCurrent: (state: OfferPdfSettingsState,
//             action: PayloadAction<OfferPdfSetting>
//         ) => {
//             state.current = action.payload;
//         },
//         setCurrentFont: (
//             state: OfferPdfSettingsState,
//             action: PayloadAction<OfferPdfFont>
//         ) => {

//             state.current && (state.current.font = { id: action.payload.id, label: action.payload.label, value: action.payload.value });

//         },
//         setPage: (state: OfferPdfSettingsState,
//             action: PayloadAction<OfferPdfPage>
//         ) => {
//             state.current.pages.push(action.payload);
//         },
//         updatePages: (state: OfferPdfSettingsState, action: PayloadAction<OfferPdfPage[]>) => {
//             if (!state.current.pages) return;

//             state.current.pages = state.current.pages.map(page => {
//                 const updatedPage = action.payload.find(p => p.id === page.id);
//                 return updatedPage || page;
//             });
//         },
//         setBlock: (state: OfferPdfSettingsState,
//             action: PayloadAction<{ block: IOfferTemplateBlock }>
//         ) => {
//             const block = action.payload.block;
//             if (state.current.pages.length === 0) {
//                 state.current.pages = [{
//                     id: uuidv4(),
//                     order: 0,
//                     type: 'letter',
//                     name: 'Новая страница',
//                     blocks: [block],
//                 }];
//             } else {
//                 const currentPage = state.current.pages[state.current.pages.length - 1];
//                 if (!currentPage) return;

//                 const needBlock = canDropBlock(currentPage, block);
//                 if (!needBlock) {
//                     state.current.pages.push({
//                         id: uuidv4(),
//                         order: 0,
//                         type: 'letter',
//                         name: `Страница ${state.current.pages.length + 1}`,
//                         blocks: [block],
//                     });
//                 } else {
//                     if (block.type === EOfferBlockType.hero.code || block.type === EOfferBlockType.header.code) {
//                         currentPage.blocks.unshift(block);
//                     } else {
//                         currentPage.blocks.push(block);
//                     }
//                 }
//             }
//         },
//         addNewPageWithBlock: (state: OfferPdfSettingsState,
//             action: PayloadAction<IOfferTemplateBlock>
//         ) => {
//             state.current.pages = state.current.pages.map(page => {
//                 page.blocks = page.blocks.filter(block => block.id !== action.payload.id);
//                 return page;
//             });
//             const newPage = getNewPage(action.payload, state.current.pages.length);
//             state.current.pages.push(newPage as OfferPdfPage);
//         },
//         deleteBlock: (state: OfferPdfSettingsState,
//             action: PayloadAction<{ blockId: string }>
//         ) => {
//             state.current.pages = state.current.pages.map(page => {
//                 page.blocks = page.blocks.filter(block => block.id !== action.payload.blockId);
//                 return page;
//             });
//             state.current.pages = state.current.pages.filter(page => page.blocks.length > 0);
//         },
//         // setEditeble: (state: OfferPdfSettingsState,
//         //     action: PayloadAction<OfferPdfBlock>
//         // ) => {
//         //
//         //     state.editeble = action.payload;
//         // },
//         saveEditeble: (
//             state: OfferPdfSettingsState,
//             action: PayloadAction<IOfferTemplateBlock>
//         ) => {
//             if (!action.payload) return;
//             const editeble = action.payload
//             state.current.pages = state.current.pages.map(page => {
//                 page.blocks = page.blocks.map(block =>
//                     block.id === editeble?.id ? editeble : block
//                 );
//                 return page;
//             });

//         },
//         // cancelEditeble: (state: OfferPdfSettingsState) => {
//         //     state.editeble = null;
//         // },
//         // editBlock: (state: OfferPdfSettingsState,
//         //     action: PayloadAction<OfferPdfBlock>
//         // ) => {
//         //     state.editeble = action.payload;
//         // },
//         setColor: (state: OfferPdfSettingsState,
//             action: PayloadAction<{ code: keyof OfferPdfSetting['colors'], value: string }>
//         ) => {
//             state.current.colors[action.payload.code].value = action.payload.value;
//         },
//         editBlockHieght: (state: OfferPdfSettingsState,
//             action: PayloadAction<{ blockId: string, height?: number }>
//         ) => {

//             const height = action.payload.height

//             if (!height) return

//             state.current.pages.map(pg => {
//                 pg.blocks.map(block => {
//                     if (block.id === action.payload.blockId) {
//                         block.height = height
//                     }
//                 })
//             })
//         },

//     }

// })

// export const {
//     setCurrent,
//     setCurrentFont,
//     setPage,
//     setBlock,
//     deleteBlock,
//     updatePages,
//     addNewPageWithBlock,
//     // setEditeble,
//     saveEditeble,
//     // cancelEditeble,
//     // editBlock,
//     // changeHeroSlogans,
//     setColor,
//     editBlockHieght
// } = offerPdfSettingsSlice.actions;
// export const offerPdfSettingsReducer = offerPdfSettingsSlice.reducer;
