import {
  EOfferBlockType,
  IOfferTemplateBlock,
} from "@/modules/entities/offer-template-block/type/offer-template-block.type";
import { IOfferTemplate } from "@/modules/entities/offer-template/type/offer-template.type";

export const getIsNeedLetterFilter = (current: IOfferTemplate) => {
  return current.pages.some((page) =>
    page.blocks.some((block) => block.type === EOfferBlockType.letter.code),
  );
};

export const getIsNeedFilterBlock = (
  current: IOfferTemplate,
  questionBlock: IOfferTemplateBlock,
) => {
  return current.pages.some((page) =>
    page.blocks.some((block) => block.type === questionBlock.type),
  );
};

// export const filterBlocksByCurrentTemplate = (blocks: IOfferBlocks, current: OfferPdfSetting) => {
//     const isNeedLetterFilter = getIsNeedLetterChoose(current)
//     if (isNeedLetterFilter) {
//         return Object.values(blocks).filter(block => block.type !== EOfferBlockType.letter.code)
//     }
//     return Object.values(blocks)
// }
