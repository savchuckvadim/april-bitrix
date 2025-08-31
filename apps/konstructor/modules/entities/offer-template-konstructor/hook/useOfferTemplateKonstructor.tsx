import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    deleteBlock,
    editBlockHieght,
    saveEditeble,
    setColor,
    setCurrent as setCurrentTemplate,
    setCurrentFont,
} from '../model/OfferTemplateKonstructorSlice';
import { setPage, setBlock } from '../model/OfferTemplateKonstructorSlice';
import { handleDragEnd } from '../lib/utils/drag-n-drop.util';
import { DragEndEvent } from '@dnd-kit/core';
import {
    IOfferTemplateBlock,
    useOfferTemplateBlock,
} from '@/modules/entities/offer-template-block';
import {
    IOfferTemplate,
    IOfferTemplateFont,
} from '@/modules/entities/offer-template/type/offer-template.type';
import { IOfferTemplatePage } from '@/modules/entities/offer-template/type/offer-template.type';
import { v4 as uuidv4 } from 'uuid';
import { setCurrent } from '@/modules/entities/offer-template/model/OfferTemplateSlice';
import { useRouter } from 'next/navigation';

export const useOfferTemplateKonstructor = () => {
    const router = useRouter();
    const settings = useAppSelector(state => state.offerTemplateKonstructor);
    const dispatch = useAppDispatch();
    const getPageById = (id: string) => {
        return settings.current?.pages.find(page => page.id === id);
    };
    const getBlockById = (id: string) => {
        return settings.current?.pages
            .flatMap(page => page.blocks)
            .find(block => block.id === id);
    };
    const getPageBlockById = (pageId: string, blockId: string) => {
        return settings.current?.pages
            .find(page => page.id === pageId)
            ?.blocks.find(block => block.id === blockId);
    };
    const { editeble, deleteEditebleBlock } = useOfferTemplateBlock();

    const saveEditebleBlock = () => {
        editeble && dispatch(saveEditeble(editeble));
        dispatch(deleteEditebleBlock());
    };

    const changeLetterBlockHieght = (blockId: string, height?: number) => {
        dispatch(editBlockHieght({ blockId, height }));
    };

    const addNewBlock = (block: IOfferTemplateBlock) => {
        const newBlock: IOfferTemplateBlock = {
            ...block,
            id: uuidv4(),
        };
        dispatch(setBlock({ block: newBlock }));
    };

    const saveTemplate = () => {
        debugger;
        console.log('saveTemplate');
        if (!settings.current) return;
        dispatch(setCurrent(settings.current));
        // dispatch(setCurrentTemplate(null))
        router.push('/offer/preview');
    };

    return {
        positions: settings.titlePositions,
        current: settings.current,
        colors: settings.current?.colors,

        // items: settings.items,

        // setEditeble: (block: OfferPdfBlock) => dispatch(setEditeble(block)),
        saveEditeble: () => saveEditebleBlock(),
        // cancelEditeble: () => dispatch(cancelEditeble()),
        // editBlock: (block: OfferPdfBlock) => dispatch(editBlock(block)),
        getPageById: getPageById,
        getBlockById: getBlockById,
        getPageBlockById: getPageBlockById,
        setCurrentFont: (font: IOfferTemplateFont) =>
            dispatch(setCurrentFont(font)),
        setPage: (page: IOfferTemplatePage) => dispatch(setPage(page)),
        addBlock: (block: IOfferTemplateBlock) => addNewBlock(block),
        // updatePages: (pages: OfferPdfPage[]) => dispatch(updatePages(pages)),
        updatePages: (event: DragEndEvent) =>
            handleDragEnd(event, settings.current, dispatch),
        deleteBlock: (blockId: string) => dispatch(deleteBlock({ blockId })),
        setColor: (code: keyof IOfferTemplate['colors'], value: string) =>
            dispatch(setColor({ code, value })),
        editBlockHieght: (blockId: string, height?: number) =>
            dispatch(editBlockHieght({ blockId, height })),
        saveTemplate: () => saveTemplate(),
    };
};
