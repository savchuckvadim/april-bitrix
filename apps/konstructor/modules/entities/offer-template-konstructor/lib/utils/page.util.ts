import { IOfferTemplatePage } from "@/modules/entities/offer-template/type/offer-template.type";
import { v4 as uuidv4 } from "uuid";

const MAX_HEIGHT = 297;

export function autoPaginatePages(
  pages: IOfferTemplatePage[],
): IOfferTemplatePage[] {
  const newPages: IOfferTemplatePage[] = [];

  for (const page of pages) {
    let currentPage: IOfferTemplatePage = { ...page, blocks: [], id: uuidv4() };
    let currentHeight = 0;

    for (const block of page.blocks) {
      if (currentHeight + block.height > MAX_HEIGHT) {
        newPages.push(currentPage);
        currentPage = { ...page, blocks: [], id: uuidv4() };
        currentHeight = 0;
      }
      currentPage.blocks.push(block);
      currentHeight += block.height;
    }

    if (currentPage.blocks.length > 0) {
      newPages.push(currentPage);
    }
  }

  return newPages;
}
