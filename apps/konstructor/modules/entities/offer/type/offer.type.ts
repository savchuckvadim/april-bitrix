import { IInfoBlock, IInfoBlockGroup } from '@/modules/entities/infoblock';
import { IOfferTemplate } from '@/modules/entities/offer-template';
import { IComplect } from '@/modules/entities/complect';

export interface IOffer {
    id: string;
    name: string;
    //   description: string;
    //   price: number;
    //   image: string;
    template: IOfferTemplate;
    infoblocks: IInfoBlockGroup[];
    complects: IComplect[];
}
