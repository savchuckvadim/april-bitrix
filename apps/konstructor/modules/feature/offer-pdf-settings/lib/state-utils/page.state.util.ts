import { AppDispatch } from "@/modules/app";
import { OfferPdfBlock, OfferPdfPage, OfferPdfSettingsState, updatePages } from "../../model/OfferPdfSettingsSlice";


export const updateDifferentPages = (
    dispatch: AppDispatch,
    sourcePage: OfferPdfPage,
    targetPage: OfferPdfPage,
    activeId: string,
    overId: string
): void => {
    const copySourcePage = { ...sourcePage }
    const copyTargetPage = { ...targetPage }
    copySourcePage.blocks = [...copySourcePage.blocks]
    copyTargetPage.blocks = [...copyTargetPage.blocks]

    const sourceBlockIndex = copySourcePage.blocks.findIndex(b => b.id === activeId);
    debugger
    const [movedBlock] = copySourcePage.blocks.splice(sourceBlockIndex, 1);
    debugger
    const targetIndex = copyTargetPage.blocks.findIndex(b => b.id === overId);
    copyTargetPage.blocks.splice(targetIndex, 0, movedBlock as OfferPdfBlock);
    debugger
    dispatch(updatePages([copySourcePage, copyTargetPage]));
}

export const updateIdenticalPages = (
    dispatch: AppDispatch,
    sourcePage: OfferPdfPage,
    activeId: string,
    overId: string
) => {
    const updatedPage = { ...sourcePage, blocks: [...sourcePage.blocks] };
    debugger
    const fromIndex = updatedPage.blocks.findIndex(b => b.id === activeId);
    const toIndex = updatedPage.blocks.findIndex(b => b.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    debugger
    const [movedBlock] = updatedPage.blocks.splice(fromIndex, 1);
    if (!movedBlock) return;
    updatedPage.blocks.splice(toIndex, 0, movedBlock);
    debugger
    dispatch(updatePages([updatedPage]));
}

