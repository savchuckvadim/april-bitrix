// import { AppDispatch } from "@/modules/app";
// import {  addNewPageWithBlock, OfferPdfPage, updatePages } from "../../model/OfferPdfSettingsSlice";
// import { canDropBlock } from "./block-state.util";

// export const addNewPage = (
//   dispatch: AppDispatch,
//   sourcePage: OfferPdfPage,
//   activeId: string,

// ): void => {
//   const copySourcePage = { ...sourcePage, blocks: [...sourcePage.blocks] };

//   const sourceBlockIndex = copySourcePage.blocks.findIndex(b => b.id === activeId);
//   if (sourceBlockIndex === -1) return;

//   const [movedBlock] = copySourcePage.blocks.splice(sourceBlockIndex, 1);
//   if (!movedBlock) return;

//   dispatch(addNewPageWithBlock(movedBlock));
// };

// export const updateDifferentPages = (
//     dispatch: AppDispatch,
//     sourcePage: OfferPdfPage,
//     targetPage: OfferPdfPage,
//     activeId: string,
//     overId: string | null
//   ): void => {
//     const copySourcePage = { ...sourcePage, blocks: [...sourcePage.blocks] };
//     const copyTargetPage = { ...targetPage, blocks: [...targetPage.blocks] };

//     const sourceBlockIndex = copySourcePage.blocks.findIndex(b => b.id === activeId);
//     if (sourceBlockIndex === -1) return;

//     const [movedBlock] = copySourcePage.blocks.splice(sourceBlockIndex, 1);
//     if (!movedBlock) return;
//      const isCanDrop = canDropBlock(copyTargetPage, movedBlock);
//     if (!isCanDrop) {
//      alert('Страница переполнена');
//       return;
//     }

//     if (overId) {
//       const targetIndex = copyTargetPage.blocks.findIndex(b => b.id === overId);
//       copyTargetPage.blocks.splice(targetIndex, 0, movedBlock);
//     } else {
//       // Вставляем в конец страницы
//       copyTargetPage.blocks.push(movedBlock);
//     }

//     dispatch(updatePages([copySourcePage, copyTargetPage]));
//   };

//   export const updateIdenticalPages = (
//     dispatch: AppDispatch,
//     page: OfferPdfPage,
//     activeId: string,
//     overId: string | null
//   ): void => {
//     const updatedPage = { ...page, blocks: [...page.blocks] };

//     const fromIndex = updatedPage.blocks.findIndex(b => b.id === activeId);
//     if (fromIndex === -1) return;

//     const [movedBlock] = updatedPage.blocks.splice(fromIndex, 1);
//     if (!movedBlock) return;

//     if (overId) {
//       let toIndex = updatedPage.blocks.findIndex(b => b.id === overId);
//       if (toIndex === -1) {
//         updatedPage.blocks.push(movedBlock);
//       } else {
//         updatedPage.blocks.splice(toIndex, 0, movedBlock);
//       }
//     } else {
//       updatedPage.blocks.push(movedBlock);
//     }

//     dispatch(updatePages([updatedPage]));
//   };

// // export const updateDifferentPages = (
// //     dispatch: AppDispatch,
// //     sourcePage: OfferPdfPage,
// //     targetPage: OfferPdfPage,
// //     activeId: string,
// //     overId: string
// // ): void => {
// //     const copySourcePage = { ...sourcePage }
// //     const copyTargetPage = { ...targetPage }
// //     copySourcePage.blocks = [...copySourcePage.blocks]
// //     copyTargetPage.blocks = [...copyTargetPage.blocks]

// //     const sourceBlockIndex = copySourcePage.blocks.findIndex(b => b.id === activeId);
// //
// //     const [movedBlock] = copySourcePage.blocks.splice(sourceBlockIndex, 1);
// //
// //     const targetIndex = copyTargetPage.blocks.findIndex(b => b.id === overId);
// //     copyTargetPage.blocks.splice(targetIndex, 0, movedBlock as OfferPdfBlock);
// //
// //     dispatch(updatePages([copySourcePage, copyTargetPage]));
// // }

// // export const updateIdenticalPages = (
// //     dispatch: AppDispatch,
// //     sourcePage: OfferPdfPage,
// //     activeId: string,
// //     overId: string
// // ) => {
// //     const updatedPage = { ...sourcePage, blocks: [...sourcePage.blocks] };
// //
// //     const fromIndex = updatedPage.blocks.findIndex(b => b.id === activeId);
// //     const toIndex = updatedPage.blocks.findIndex(b => b.id === overId);
// //     if (fromIndex === -1 || toIndex === -1) return;
// //
// //     const [movedBlock] = updatedPage.blocks.splice(fromIndex, 1);
// //     if (!movedBlock) return;
// //     updatedPage.blocks.splice(toIndex, 0, movedBlock);
// //
// //     dispatch(updatePages([updatedPage]));
// // }
