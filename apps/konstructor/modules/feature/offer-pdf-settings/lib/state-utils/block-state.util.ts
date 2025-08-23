// import { PAGE_HEIGHT_MM } from "@/modules/pages/offer-preview/consts/pdf-page-layout.const";
// import { OfferPdfPage } from "../../model/OfferPdfSettingsSlice";
// import { v4 as uuidv4 } from "uuid";
// import { IOfferTemplateBlock } from "@/modules/entities/offer-template-block/type/offer-template-block.type";

// export const canDropBlock = (
//     targetPage: OfferPdfPage,
//     block: IOfferTemplateBlock,
// ) => {
//     let targetPageHeight = targetPage?.blocks.reduce((acc, block) => acc + block.height, 0) || 0;
//     targetPageHeight += 20 * targetPage?.blocks.length // паддинги и маржины всех блоков

//     const newPageHeight = targetPageHeight + block.height;
//     const isCanDrop = newPageHeight < PAGE_HEIGHT_MM;
//     return isCanDrop;
// }

// export const getNewPage = (
//     block: IOfferTemplateBlock,
//     order: number,
// ) => {

//     return {
//         id: uuidv4(),
//         order: order,
//         type: 'letter',
//         name: 'Новая страница',
//         blocks: [block],
//     }
// }
