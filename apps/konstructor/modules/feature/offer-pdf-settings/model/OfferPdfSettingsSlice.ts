import { PAGE_HEIGHT_MM } from "@/modules/pages/offer-preview/consts/pdf-page-layout.const";
import { fakeText } from "@/modules/pages/offer-template-settings/ui/components/BlockChooseItem";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid";

export interface OfferPdfSettingsState {
    current: OfferPdfSetting;
    items: OfferPdfSetting[];
    default: typeof blocks;
    editeble: OfferPdfBlock | null
}
export interface OfferPdfSetting {
    id: string;
    name: string;
    style: any;
    font: OfferPdfFont;
    pages: OfferPdfPage[];
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
export const blocks = {
    hero: {
        id: '0' as string,
        type: 'hero',
        name: 'Заставка',
        order: 0 as const,
        content: {
            image: '/cover/hero.avif',
            slogan: 'Сделайте первый шаг к успеху',
            subtitle: 'Сделайте первый шаг к успеху',
        },
        height: 97,
        exclusive: ['bigLetter',],
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
}

const initialState = {
    current: current,
    items: [current],
    default: blocks,
    editeble: null as  null | OfferPdfBlock
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
            state.current && (state.current.font = { id: action.payload.id, label: action.payload.label, value: action.payload.value });
        },
        setPage: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfPage>
        ) => {
            state.current.pages.push(action.payload);
        },
        updatePages: (state: OfferPdfSettingsState, action: PayloadAction<OfferPdfPage[]>) => {
            if (!state.current.pages) return;
            debugger
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

                let currentPageHeight = currentPage?.blocks.reduce((acc, block) => acc + block.height, 0) || 0;
                const newPageHeight = currentPageHeight + action.payload.block.height;
                const needBlock = newPageHeight < PAGE_HEIGHT_MM;
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
        setEditeble: (state: OfferPdfSettingsState,
            action: PayloadAction<OfferPdfBlock>
        ) => {
            state.editeble = action.payload;
        },
        saveEditeble: (state: OfferPdfSettingsState) => {
            state.editeble = null;
        },
        cancelEditeble: (state: OfferPdfSettingsState) => {
            state.editeble = null;
        }

    }

})

export const {
    setCurrent,
    setCurrentFont,
    setPage,
    setBlock,
    updatePages
} = offerPdfSettingsSlice.actions;
export const offerPdfSettingsReducer = offerPdfSettingsSlice.reducer;
