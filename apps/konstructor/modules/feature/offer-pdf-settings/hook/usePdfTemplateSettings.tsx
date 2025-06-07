import { useAppDispatch, useAppSelector } from "@/modules/app";
import {
    cancelEditeble, deleteBlock, editBlock, OfferPdfBlock,
    OfferPdfFont, OfferPdfPage, OfferPdfSetting, saveEditeble, setColor,
    setCurrentFont, setEditeble
}
    from "../model/OfferPdfSettingsSlice";
import { setCurrent, setPage, setBlock } from "../model/OfferPdfSettingsSlice";
import { handleDragEnd } from "../lib/utils/drag-n-drop.util";
import { DragEndEvent } from "@dnd-kit/core";


export const usePdfTemplateSettings = () => {
    const settings = useAppSelector((state) => state.offerPdfSettings);
    const dispatch = useAppDispatch();
    const getPageById = (id: string) => {
        return settings.current.pages.find(page => page.id === id);
    }
    const getBlockById = (id: string) => {
        return settings.current.pages.flatMap(page => page.blocks).find(block => block.id === id);
    }
    const getPageBlockById = (pageId: string, blockId: string) => {
        return settings.current.pages.find(page => page.id === pageId)?.blocks.find(block => block.id === blockId);
    }
    return {
        current: settings.current,
        colors: settings.current.colors,
        default: settings.default,
        items: settings.items,
        editeble: settings.editeble,
        setEditeble: (block: OfferPdfBlock) => dispatch(setEditeble(block)),
        saveEditeble: () => dispatch(saveEditeble()),
        cancelEditeble: () => dispatch(cancelEditeble()),
        editBlock: (block: OfferPdfBlock) => dispatch(editBlock(block)),
        getPageById: getPageById,
        getBlockById: getBlockById,
        getPageBlockById: getPageBlockById,
        setCurrent: (current: OfferPdfSetting) => dispatch(setCurrent(current)),
        setCurrentFont: (font: OfferPdfFont) => dispatch(setCurrentFont(font)),
        setPage: (page: OfferPdfPage) => dispatch(setPage(page)),
        setBlock: (block: OfferPdfBlock) => dispatch(setBlock({ block })),
        // updatePages: (pages: OfferPdfPage[]) => dispatch(updatePages(pages)),
        updatePages: (event: DragEndEvent) => handleDragEnd(event, settings.current, dispatch),
        deleteBlock: (blockId: string) => dispatch(deleteBlock({ blockId })),
        setColor: (code: keyof OfferPdfSetting['colors'], value: string) => dispatch(setColor({ code, value })),
    };
}
