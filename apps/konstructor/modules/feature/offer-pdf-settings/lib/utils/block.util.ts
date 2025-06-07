import { OfferPdfBlock, OfferPdfPage, OfferPdfSetting } from "../../model/OfferPdfSettingsSlice";

export function findPageByBlockId(current: OfferPdfSetting, blockId: string): OfferPdfPage | undefined {
    return current.pages.find(p => p.blocks.some(b => b.id === blockId));
}

export function findBlockById(current: OfferPdfSetting, blockId: string): OfferPdfBlock | undefined {
    return current.pages.flatMap(p => p.blocks).find(b => b.id === blockId);
}
