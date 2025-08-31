import {
    EOfferBlockType,
    IOfferTemplateBlock,
} from '@/modules/entities/offer-template-block/type/offer-template-block.type';

export const isChanging = (block: IOfferTemplateBlock) => {
    return (
        block.type === EOfferBlockType.hero.code ||
        block.type === EOfferBlockType.letter.code ||
        block.type === EOfferBlockType.header.code ||
        block.type === EOfferBlockType.logo.code ||
        block.type === EOfferBlockType.slogan.code
    );
};
