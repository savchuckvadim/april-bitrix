// import { useAppDispatch, useAppSelector } from "@/modules/app";
// import {
//     deleteBlock,
//     editBlockHieght,
//     OfferPdfFont, OfferPdfPage, OfferPdfSetting, saveEditeble, setColor,
//     setCurrentFont,
// }
//     from "../model/OfferPdfSettingsSlice";
// import { setCurrent, setPage, setBlock } from "../model/OfferPdfSettingsSlice";
// import { handleDragEnd } from "../lib/utils/drag-n-drop.util";
// import { DragEndEvent } from "@dnd-kit/core";
// import { IOfferTemplateBlock, useOfferTemplateBlock } from "@/modules/entities/offer-template-block";

// export const useOfferTemplateSettings = () => {
//     const settings = useAppSelector((state) => state.offerPdfSettings);
//     const dispatch = useAppDispatch();
//     const getPageById = (id: string) => {
//         return settings.current.pages.find(page => page.id === id);
//     }
//     const getBlockById = (id: string) => {
//         return settings.current.pages.flatMap(page => page.blocks).find(block => block.id === id);
//     }
//     const getPageBlockById = (pageId: string, blockId: string) => {
//         return settings.current.pages.find(page => page.id === pageId)?.blocks.find(block => block.id === blockId);
//     }
//     const { editeble, deleteEditebleBlock } = useOfferTemplateBlock()

//     const saveEditebleBlock = () => {
//         editeble && dispatch(saveEditeble(editeble))
//         dispatch(deleteEditebleBlock())
//     }

//     const changeLetterBlockHieght = (blockId: string, height?: number) => {
//         dispatch(editBlockHieght({ blockId, height }))
//     }

//     return {
//         positions: settings.titlePositions,
//         current: settings.current,
//         colors: settings.current.colors,

//         items: settings.items,

//         // setEditeble: (block: OfferPdfBlock) => dispatch(setEditeble(block)),
//         saveEditeble: () => saveEditebleBlock(),
//         // cancelEditeble: () => dispatch(cancelEditeble()),
//         // editBlock: (block: OfferPdfBlock) => dispatch(editBlock(block)),
//         getPageById: getPageById,
//         getBlockById: getBlockById,
//         getPageBlockById: getPageBlockById,
//         setCurrent: (current: OfferPdfSetting) => dispatch(setCurrent(current)),
//         setCurrentFont: (font: OfferPdfFont) => dispatch(setCurrentFont(font)),
//         setPage: (page: OfferPdfPage) => dispatch(setPage(page)),
//         setBlock: (block: IOfferTemplateBlock) => dispatch(setBlock({ block })),
//         // updatePages: (pages: OfferPdfPage[]) => dispatch(updatePages(pages)),
//         updatePages: (event: DragEndEvent) => handleDragEnd(event, settings.current, dispatch),
//         deleteBlock: (blockId: string) => dispatch(deleteBlock({ blockId })),
//         setColor: (code: keyof OfferPdfSetting['colors'], value: string) => dispatch(setColor({ code, value })),
//         editBlockHieght: (blockId: string, height?: number) => dispatch(editBlockHieght({ blockId, height })),
//     };
// }
