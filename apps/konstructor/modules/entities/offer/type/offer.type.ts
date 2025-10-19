import { IInfoBlockGroup } from '@/modules/entities/infoblock';
import { IOfferTemplate } from '@/modules/entities/offer-template';
import { IComplect } from '@/modules/entities/complect';
import { OfferTemplateDto } from '@workspace/nest-api';

export interface IOffer {
    id: string;
    name: string;
    //   description: string;
    //   price: number;
    //   image: string;
    template: OfferTemplateDto;
    infoblocks: IInfoBlockGroup[];
    complects: IComplect[];
}
