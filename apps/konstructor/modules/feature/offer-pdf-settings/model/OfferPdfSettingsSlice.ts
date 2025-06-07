import { PAGE_HEIGHT_MM } from "@/modules/pages/offer-preview/consts/pdf-page-layout.const";
import { fakeText } from "@/modules/pages/offer-template-settings/ui/components/BlockChoose/BlockChooseItem";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid";
import { canDropBlock, getNewPage } from "../lib/state-utils/block-state.util";

export interface OfferPdfSettingsState {
    current: OfferPdfSetting;
    items: OfferPdfSetting[];
    default: typeof blocks;
    editeble: OfferPdfBlock | null
    titlePositions: typeof titlePositions
}
export interface OfferPdfSetting {
    id: string;
    name: string;
    style: any;
    font: OfferPdfFont;
    pages: OfferPdfPage[];
    colors: {


        text: {
            code: 'text',
            value: string;
            name: 'Текст'
        };
        background: {
            code: 'background',
            value: string;
            name: 'Фон'
        };
        border: {
            code: 'border',
            value: string;
            name: 'Граница'
        };
        accent: {
            code: 'accent',
            value: string;
            name: 'Заголовки'
        };
        accentText: {
            code: 'accentText',
            value: string;
            name: 'Акцентный текст'
        };
        base: {
            code: 'base',
            value: string;
            name: 'Фирменный цвет'
        };
    }
}
export interface OfferPdfPage {
    id: string;
    order: number;
    type: 'letter' | 'description' | 'infoblocks' | 'price';
    name: string;
    blocks: OfferPdfBlock[];
}
export type OfferPdfBlock = typeof blocks[keyof typeof blocks];
export type OfferPdfFont = { id: number, label: string, value: string };
// {
//     id: string;
//     name: string;
//     order: number;
//     content: any;
//     type: 'hero' | 'letter'| 'logo' | 'stamp'| 'signature' | 'text' | 'image' | 'table' | 'divider' | 'footer' | 'header' | 'pagebreak' | 'qrcode' | 'barcode' | 'infoblocks' | 'description' | 'price' | 'manager'  ;
// }
const titlePositions = [
    {
        id: 0,
        name: 'Слева сверху',
        left: 0,
        top: 0,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background'
    },
    {
        id: 1,
        name: 'Слева снизу',
        left: 0,
        top: 100,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background'
    },
    {
        id: 2,
        name: 'Справа сверху',
        left: 100,
        top: 0,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background'
    },
    {
        id: 3,
        name: 'Справа снизу',
        left: 100,
        top: 100,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background'
    },
    {
        id: 4,
        name: 'По центру',
        left: 50,
        top: 50,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background'
    },

]
export const blocks = {
    hero: {
        id: '0' as string,
        type: 'hero',
        name: 'Заставка',
        order: 0 as const,
        content: {
            image: '/cover/hero.avif' as string,
            slogan: {
                text: 'Сделайте первый шаг к успеху' as string,
                position: 'relative' as 'relative' | 'absolute',
                left: 0,
                top: 0,
                isActive: true,
                style: 'text' as 'text' | 'border' | 'background'
            },
            subtitle: {
                text: 'Сделайте первый шаг к успеху' as string,
                position: 'relative' as 'relative' | 'absolute',
                left: 0,
                top: 0,
                isActive: true,
                style: 'text' as 'text' | 'border' | 'background'
            },
        },
        height: 97,
        exclusive: ['bigLetter'],
        data: {},
        position: 'relative' as const
    },
    letter: {
        id: '1' as string,
        type: 'letter',
        name: 'Сопроводительное письмо',
        order: 2,
        content: {
            text: fakeText,
            appeal: 'Уважаемый',
            withAppeal: true,
        },
        height: 50,
        data: {},
        exclusive: ['bigLetter',],
        position: 'relative' as const
    },
    bigLetter: {
        id: '2' as string,
        type: 'bigLetter',
        name: 'Большое письмо',
        order: 3,
        content: {
            text: fakeText.repeat(4),
            appeal: 'Уважаемый',
            withAppeal: true,
        },
        height: 130,
        data: {},
        exclusive: ['bigLetter'],
        position: 'relative' as const
    },
    documentNumber: {
        id: '3' as string,
        type: 'documentNumber',
        name: 'Номер документа',
        order: 4,
        content: {
            number: '№34 от 12.03.2025',
            appeal: 'Директору',
            company: 'ЗАО "Конструктор"',
            manager: 'Иванов Пётр Петрович',
            email: 'info@garant.ru',
            inn: '1234567890',
        },
        height: 20,
        data: {},
        position: 'relative' as const
    },
    manager: {
        id: '4' as string,
        type: 'manager',
        name: 'Менеджер',
        order: 5,
        content: {
            name: 'Иванов Пётр Петрович',
            position: 'Директор по Продажам',
            phone: '+7 (999) 999-99-99',
            email: 'info@garant.ru',
        },
        height: 20 as const,
        data: {},
        position: 'relative' as const
    },
    logo: {
        id: '5' as string,
        type: 'logo',
        name: 'Логотип',
        order: 6,
        content: {
            image: '/logo/garant.png',
            position: 'relative' as 'relative' | 'absolute',
            left: 0,
            top: 0,
        },
        position: 'relative' as 'relative' | 'absolute',
        left: 0,
        top: 0,
        height: 5 as const,
        data: {},

    },
    stamp: {
        id: '6' as string,
        type: 'stamp',
        name: 'Stamp',
        order: 7,
        content: {
            stamp: '/stamp/stamp.png',
            signature: '/stamp/signature.png',
            director: 'Иванов Пётр Петрович',
            directorPosition: 'Директор по Продажам',
            company: 'ЗАО "Конструктор"',
            email: 'info@garant.ru',
            inn: '1234567890',
            position: 'relative' as 'relative' | 'absolute',
            left: 0,
            top: 0,
        },
        height: 5 as const,
        data: {},
        position: 'relative' as const
    },
    header: {
        id: '7' as string,
        type: 'header',
        name: 'header',
        order: 8,
        content: {
            mode: 'doubleRq' as 'doubleRq' | 'logoRq',
            rq: {
                name: 'ООО Партнер',
                inn: '1234567890',
                address: 'Санкт-Петербург, пр. Гагарина 73',
                email: 'info@garant.ru',
            },
            logo: {
                image: '/logo/garant.png',

            }
        },
        position: 'absolute' as 'relative' | 'absolute',
        left: 0,
        top: 0,
        height: 20 as const,
    },
    footer: {
        id: '8' as string,
        type: 'footer',
        name: 'footer',
        order: 9,
        content: {
            mode: 'manager' as 'manager' | 'company' | 'image' | 'empty',
            manager: {
                name: 'Иванов Пётр Петрович' as string,
                position: 'Директор по Продажам' as string,
                phone: '+7 (999) 999-99-99' as string,
                email: 'info@garant.ru' as string,
            },
            company: {
                name: 'ООО Партнер' as string,
                inn: '1234567890' as string,
                address: 'Санкт-Петербург, пр. Гагарина 73' as string,
                email: 'info@garant.ru' as string,
            },
            image: {
                image: '/logo/garant.png' as string,
                position: 'relative' as 'relative' | 'absolute',
                left: 0 as number,
                top: 0 as number,
            },
            left: 'manager' as 'manager' | 'company' | 'image' | 'empty',
            right: 'company' as 'manager' | 'company' | 'image' | 'empty',
        },
        data: {},
        height: 5 as const,
        position: 'absolute' as 'relative' | 'absolute',
        bottom: 0,
        left: 0,
    }

} as const
const current: OfferPdfSetting = {
    id: '0',
    name: 'Новый шаблон',
    style: {},
    font: { id: 0, label: 'Georgia', value: '"Georgia", serif' } as OfferPdfFont,
    pages: [],
    colors: {
        base: {
            code: 'base',
            value: '#000000',
            name: 'Фирменный цвет'
        },
        text: {
            code: 'text',
            value: '#000000',
            name: 'Текст'
        },
        background: {
            code: 'background',
            value: '#ffffff',
            name: 'Фон'
        },
        border: {
            code: 'border',
            value: '#000000',
            name: 'Граница'
        },
        accent: {
            code: 'accent',
            value: '#000000',
            name: 'Заголовки'
        },
        accentText: {
            code: 'accentText',
            value: '#000000',
            name: 'Акцентный текст'
        },
    }
}

const initialState = {
    current: current,
    items: [current],
    default: structuredClone(blocks) as typeof blocks,
    editeble: null as null | OfferPdfBlock,
    titlePositions: titlePositions,

} as OfferPdfSettingsState

export const offerPdfSettingsSlice = createSlice({
    name: 'offerPdfSettings',
    initialState,
    reducers: {
        setCurrent: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfSetting>
        ) => {
            state.current = action.payload;
        },
        setCurrentFont: (
            state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfFont>
        ) => {
            debugger
            state.current && (state.current.font = { id: action.payload.id, label: action.payload.label, value: action.payload.value });
            debugger
        },
        setPage: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfPage>
        ) => {
            state.current.pages.push(action.payload);
        },
        updatePages: (state: OfferPdfSettingsState, action: PayloadAction<OfferPdfPage[]>) => {
            if (!state.current.pages) return;

            state.current.pages = state.current.pages.map(page => {
                const updatedPage = action.payload.find(p => p.id === page.id);
                return updatedPage || page;
            });
        },
        setBlock: (state: OfferPdfSettingsState,
            action: PayloadAction<{ block: OfferPdfBlock }>
        ) => {
            if (state.current.pages.length === 0) {
                state.current.pages = [{
                    id: uuidv4(),
                    order: 0,
                    type: 'letter',
                    name: 'Новая страница',
                    blocks: [action.payload.block],
                }];
            } else {
                const currentPage = state.current.pages[state.current.pages.length - 1];
                if (!currentPage) return;

                // let currentPageHeight = currentPage?.blocks.reduce((acc, block) => acc + block.height, 0) || 0;
                // const newPageHeight = currentPageHeight + action.payload.block.height;
                const needBlock = canDropBlock(currentPage, action.payload.block);
                if (!needBlock) {
                    state.current.pages.push({
                        id: uuidv4(),
                        order: 0,
                        type: 'letter',
                        name: `Страница ${state.current.pages.length + 1}`,
                        blocks: [action.payload.block],
                    });
                } else {
                    if (action.payload.block.type === 'header') {
                        currentPage.blocks.unshift(action.payload.block);
                    } else {
                        currentPage.blocks.push(action.payload.block);
                    }

                }
            }
        },
        addNewPageWithBlock: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfBlock>
        ) => {
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.filter(block => block.id !== action.payload.id);
                return page;
            });
            const newPage = getNewPage(action.payload, state.current.pages.length);
            state.current.pages.push(newPage as OfferPdfPage);
        },
        deleteBlock: (state: OfferPdfSettingsState,
            action: PayloadAction<{ blockId: string }>
        ) => {
            debugger
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.filter(block => block.id !== action.payload.blockId);
                return page;
            });
            state.current.pages = state.current.pages.filter(page => page.blocks.length > 0);
            debugger
        },
        setEditeble: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfBlock>
        ) => {
            debugger
            state.editeble = action.payload;
        },
        saveEditeble: (
            state: OfferPdfSettingsState,

        ) => {
            if (!state.editeble) return;
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.map(block => block.id === state.editeble?.id ? state.editeble : block);
                return page;
            });
            state.editeble = null;
        },
        cancelEditeble: (state: OfferPdfSettingsState) => {
            state.editeble = null;
        },
        editBlock: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfBlock>
        ) => {
            state.editeble = action.payload;
        },
        setColor: (state: OfferPdfSettingsState,
            action: PayloadAction<{ code: keyof OfferPdfSetting['colors'], value: string }>
        ) => {
            state.current.colors[action.payload.code].value = action.payload.value;
        },
        changeHeroSlogans(
            state: OfferPdfSettingsState,
            action: PayloadAction<{ value: string, code: 'slogan' | 'subtitle' }>
        ) {
            if (!state.editeble) return;
            if (state.editeble.type !== 'hero') return;
            const key = action.payload.code;
            state.editeble.content[key].text = action.payload.value;
        }



    }

})

export const {
    setCurrent,
    setCurrentFont,
    setPage,
    setBlock,
    deleteBlock,
    updatePages,
    addNewPageWithBlock,
    setEditeble,
    saveEditeble,
    cancelEditeble,
    editBlock,
    setColor
} = offerPdfSettingsSlice.actions;
export const offerPdfSettingsReducer = offerPdfSettingsSlice.reducer;
