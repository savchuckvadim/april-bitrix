import { IOfferTemplateBlock } from "../../offer-template-block/type/offer-template-block.type";

export interface IOfferTemplate {
  id: string;
  name: string;
  description: string;
  font: IOfferTemplateFont;
  colors: IOfferTemplateColors;
  pages: IOfferTemplatePage[];
}

export interface IOfferTemplatePage {
  id: string;
  order: number;
  type: "letter" | "description" | "infoblocks" | "price";
  name: string;
  blocks: Array<IOfferTemplateBlock>;
}

export interface IOfferTemplateColors {
  text: {
    code: "text";
    value: string;
    name: "Текст";
  };
  background: {
    code: "background";
    value: string;
    name: "Фон";
  };
  // border: {
  //     code: 'border',
  //     value: string;
  //     name: 'Граница'
  // };
  accent: {
    code: "accent";
    value: string;
    name: "Заголовки";
  };
  accentText: {
    code: "accentText";
    value: string;
    name: "Акцентный текст";
  };
  // base: {
  //     code: 'base',
  //     value: string;
  //     name: 'Фирменный цвет'
  // };
}

export type IOfferTemplateFont = { id: number; label: string; value: string };
