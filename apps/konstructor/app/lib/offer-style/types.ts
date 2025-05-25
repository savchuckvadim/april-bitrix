export type BlockType = 'header' | 'text' | 'image' | 'textImage' | 'price' | 'footer';

export interface Block {
    id: string;
    type: BlockType;
    data: Record<string, any>;
}

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