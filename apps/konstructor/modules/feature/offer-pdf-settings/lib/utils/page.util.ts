// import { OfferPdfPage } from "../../model/OfferPdfSettingsSlice";
// import { v4 as uuidv4 } from 'uuid';

// const MAX_HEIGHT = 297;

// export function autoPaginatePages(pages: OfferPdfPage[]): OfferPdfPage[] {
//   const newPages: OfferPdfPage[] = [];

//   for (const page of pages) {
//     let currentPage: OfferPdfPage = { ...page, blocks: [], id: uuidv4() };
//     let currentHeight = 0;

//     for (const block of page.blocks) {
//       if (currentHeight + block.height > MAX_HEIGHT) {
//         newPages.push(currentPage);
//         currentPage = { ...page, blocks: [], id: uuidv4() };
//         currentHeight = 0;
//       }
//       currentPage.blocks.push(block);
//       currentHeight += block.height;
//     }

//     if (currentPage.blocks.length > 0) {
//       newPages.push(currentPage);
//     }
//   }

//   return newPages;
// }
