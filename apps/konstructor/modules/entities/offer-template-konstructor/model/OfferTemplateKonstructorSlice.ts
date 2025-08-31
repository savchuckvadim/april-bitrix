import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { canDropBlock, getNewPage } from '../lib/state-utils/block-state.util';
import {
    EOfferBlockType,
    IOfferBlock,
} from '@/modules/entities/offer-template-block/type/offer-template-block.type';
import { IOfferTemplateBlock } from '@/modules/entities/offer-template-block/type/offer-template-block.type';
import {
    IOfferTemplate,
    IOfferTemplateColors,
    IOfferTemplateFont,
    IOfferTemplatePage,
} from '../../offer-template/type/offer-template.type';
import {
    defaultTemplate,
    titlePositions,
} from '../consts/offer-template-konstructor.consts';
import { IOfferTemplateKonstructorState } from '../type/offer-template-konstructor.type';

const initialState = {
    defaultTemplate: defaultTemplate,
    current: defaultTemplate,
    // items: [current],
    // editeble: null as null | IOfferTemplateBlock,
    titlePositions: titlePositions,
} as IOfferTemplateKonstructorState;

export const offerTemplateKonstructorSlice = createSlice({
    name: 'offerTemplateKonstructor',
    initialState,
    reducers: {
        setCurrent: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplate | null>,
        ) => {
            state.current = action.payload;
        },
        setCurrentFont: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplateFont>,
        ) => {
            state.current &&
                (state.current.font = {
                    id: action.payload.id,
                    label: action.payload.label,
                    value: action.payload.value,
                });
        },
        setPage: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplatePage>,
        ) => {
            state.current?.pages.push(action.payload);
        },
        updatePages: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplatePage[]>,
        ) => {
            if (!state.current?.pages) return;

            state.current.pages = state.current.pages.map(page => {
                const updatedPage = action.payload.find(p => p.id === page.id);
                return updatedPage || page;
            });
        },
        setBlock: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<{ block: IOfferTemplateBlock }>,
        ) => {
            if (!state.current) return;
            const block = action.payload.block;
            if (state.current.pages.length === 0) {
                state.current.pages = [
                    {
                        id: uuidv4(),
                        order: 0,
                        type: 'letter',
                        name: 'Новая страница',
                        blocks: [block],
                    },
                ];
            } else {
                const currentPage =
                    state.current.pages[state.current.pages.length - 1];
                if (!currentPage) return;

                const needBlock = canDropBlock(currentPage, block);
                if (!needBlock) {
                    state.current.pages.push({
                        id: uuidv4(),
                        order: 0,
                        type: 'letter',
                        name: `Страница ${state.current.pages.length + 1}`,
                        blocks: [block],
                    });
                } else {
                    if (
                        block.type === EOfferBlockType.hero.code ||
                        block.type === EOfferBlockType.header.code
                    ) {
                        currentPage.blocks.unshift(block);
                    } else {
                        currentPage.blocks.push(block);
                    }
                }
            }
        },
        addNewPageWithBlock: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplateBlock>,
        ) => {
            if (!state.current) return;
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.filter(
                    block => block.id !== action.payload.id,
                );
                return page;
            });
            const newPage = getNewPage(
                action.payload,
                state.current.pages.length,
            );
            state.current.pages.push(newPage as IOfferTemplatePage);
        },
        deleteBlock: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<{ blockId: string }>,
        ) => {
            if (!state.current) return;
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.filter(
                    block => block.id !== action.payload.blockId,
                );
                return page;
            });
            state.current.pages = state.current.pages.filter(
                page => page.blocks.length > 0,
            );
        },
        // setEditeble: (state: OfferPdfSettingsState,
        //     action: PayloadAction<OfferPdfBlock>
        // ) => {
        //
        //     state.editeble = action.payload;
        // },
        saveEditeble: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<IOfferTemplateBlock>,
        ) => {
            if (!action.payload) return;
            if (!state.current) return;
            const editeble = action.payload;
            state.current.pages = state.current.pages.map(page => {
                page.blocks = page.blocks.map(block =>
                    block.id === editeble?.id ? editeble : block,
                );
                return page;
            });
        },
        // cancelEditeble: (state: OfferPdfSettingsState) => {
        //     state.editeble = null;
        // },
        // editBlock: (state: OfferPdfSettingsState,
        //     action: PayloadAction<OfferPdfBlock>
        // ) => {
        //     state.editeble = action.payload;
        // },
        setColor: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<{
                code: keyof IOfferTemplate['colors'];
                value: string;
            }>,
        ) => {
            if (!state.current) return;
            state.current.colors[action.payload.code].value =
                action.payload.value;
        },
        editBlockHieght: (
            state: IOfferTemplateKonstructorState,
            action: PayloadAction<{ blockId: string; height?: number }>,
        ) => {
            const height = action.payload.height;

            if (!height) return;

            if (!state.current) return;

            state.current.pages.map(pg => {
                pg.blocks.map(block => {
                    if (block.id === action.payload.blockId) {
                        block.height = height;
                    }
                });
            });
        },
    },
});

export const {
    setCurrent,
    setCurrentFont,
    setPage,
    setBlock,
    deleteBlock,
    updatePages,
    addNewPageWithBlock,
    // setEditeble,
    saveEditeble,
    // cancelEditeble,
    // editBlock,
    // changeHeroSlogans,
    setColor,
    editBlockHieght,
} = offerTemplateKonstructorSlice.actions;
export const offerTemplateKonstructorReducer =
    offerTemplateKonstructorSlice.reducer;
