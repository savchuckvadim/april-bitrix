import { IOfferTemplateBlock } from '../../offer-template-block/';
import {
    IOfferTemplate,
    IOfferTemplateColors,
    IOfferTemplateFont,
    IOfferTemplatePage,
} from '../../offer-template/';
import { titlePositions } from '../consts/offer-template-konstructor.consts';

export interface IOfferTemplateKonstructorState {
    defaultTemplate: IOfferTemplate;
    current: IOfferTemplate | null;
    // items: IOfferTemplateKonstructor[];
    editeble: IOfferTemplateBlock | null;
    titlePositions: typeof titlePositions;
}
export type BlockPostions = typeof titlePositions;
export type BlockPostion = (typeof titlePositions)[0];
// export interface IOfferTemplateKonstructor {
//     id: string;
//     name: string;
//     // style: any;
//     font: IOfferTemplateFont;
//     pages: IOfferTemplatePage[];
//     colors: IOfferTemplateColors

// }
