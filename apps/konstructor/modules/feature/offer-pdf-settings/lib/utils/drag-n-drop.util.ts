import { DragEndEvent } from "@dnd-kit/core";

import { findPageByBlockId } from "./block.util";
import { AppDispatch, useAppDispatch } from "@/modules/app";
import { OfferPdfSetting, updatePages, OfferPdfBlock, setPage } from "../../model/OfferPdfSettingsSlice";
import { updateDifferentPages, updateIdenticalPages } from "../state-utils/page.state.util";

export const handleDragEnd = (
    event: DragEndEvent, current: OfferPdfSetting,
    dispatch: AppDispatch
) => {


    const { active, over } = event;
    debugger
    if (!over || active.id === over.id) return;

    const sourcePage = findPageByBlockId(current, active.id as string);
    const targetPage = findPageByBlockId(current, over.id as string);
    if (!sourcePage || !targetPage) return;


    if (sourcePage.id === targetPage.id) {
        updateIdenticalPages(
            dispatch,
            sourcePage,
            active.id as string,
            over.id as string
        )
        return;
    }

    updateDifferentPages(
        dispatch,
        sourcePage,
        targetPage,
        active.id as string,
        over.id as string
    )




};