import { useAppDispatch, useAppSelector } from "@/modules/app";
import { OfferPdfBlock, OfferPdfFont, OfferPdfPage, OfferPdfSetting, setCurrentFont, updatePages } from "../model/OfferPdfSettingsSlice";
import { setCurrent, setPage, setBlock } from "../model/OfferPdfSettingsSlice";
import { handleDragEnd } from "../lib/utils/drag-n-drop.util";
import { DragEndEvent } from "@dnd-kit/core";


export const usePdfTemplateSettings = () => {
    const settings = useAppSelector((state) => state.offerPdfSettings);
    const dispatch = useAppDispatch();
    return {
        current: settings.current,
        default: settings.default,
        items: settings.items,
        setCurrent: (current: OfferPdfSetting) => dispatch(setCurrent(current)),
        setCurrentFont: (font: OfferPdfFont) => dispatch(setCurrentFont(font)),
        setPage: (page: OfferPdfPage) => dispatch(setPage(page)),
        setBlock: (block: OfferPdfBlock) => dispatch(setBlock({ block })),
        // updatePages: (pages: OfferPdfPage[]) => dispatch(updatePages(pages)),
        updatePages: (event: DragEndEvent) => handleDragEnd(event, settings.current, dispatch),
    };
}
