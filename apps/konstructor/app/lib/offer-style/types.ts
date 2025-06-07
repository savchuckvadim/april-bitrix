import { OfferPdfBlock } from "@/modules/feature/offer-pdf-settings";

// export type BlockType = 'hero' | 'header' | 'text' | 'image' | 'textImage' | 'price' | 'footer';

// export interface Block {
//     id: string;
//     type: BlockType;
//     data: Record<string, any>;
// }
export type Block = OfferPdfBlock
export interface StylePreset {
    id: string;
    name: string;
    fontFamily: string;
    headingColor: string;
    textColor: string;
    backgroundColor: string;
}

export interface Offer {
    id: string;
    name: string;
    description: string;
    blocks: Block[];
}