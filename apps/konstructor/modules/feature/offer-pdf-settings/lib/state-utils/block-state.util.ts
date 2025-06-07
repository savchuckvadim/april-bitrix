import { PAGE_HEIGHT_MM } from "@/modules/pages/offer-preview/consts/pdf-page-layout.const";
import { OfferPdfBlock, OfferPdfPage } from "../../model/OfferPdfSettingsSlice";
import { v4 as uuidv4 } from "uuid";

export const canDropBlock = (
    targetPage: OfferPdfPage,
    block: OfferPdfBlock, 
) => {
    let targetPageHeight = targetPage?.blocks.reduce((acc, block) => acc + block.height, 0) || 0;
    const newPageHeight = targetPageHeight + block.height;
    const isCanDrop = newPageHeight < PAGE_HEIGHT_MM;
    return isCanDrop;
}

export const getNewPage = (
    block: OfferPdfBlock,
    order: number,
) => {
   
    return {
        id: uuidv4(),
        order: order,
        type: 'letter',
        name: 'Новая страница',
        blocks: [block],
    }
}