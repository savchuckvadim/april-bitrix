import { IOfferTemplateBlock } from "@/modules/entities/offer-template-block/type/offer-template-block.type";
import {
  IOfferTemplate,
  IOfferTemplatePage,
} from "@/modules/entities/offer-template/type/offer-template.type";

export function findPageByBlockId(
  current: IOfferTemplate,
  blockId: string,
): IOfferTemplatePage | undefined {
  return current.pages.find((p) => p.blocks.some((b) => b.id === blockId));
}

export function findBlockById(
  current: IOfferTemplate,
  blockId: string,
): IOfferTemplateBlock | undefined {
  return current.pages.flatMap((p) => p.blocks).find((b) => b.id === blockId);
}
