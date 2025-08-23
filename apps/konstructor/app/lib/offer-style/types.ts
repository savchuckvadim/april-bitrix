import { IOfferTemplateBlock } from "@/modules/entities/offer-template-block/type/offer-template-block.type";

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
  blocks: IOfferTemplateBlock[];
}
