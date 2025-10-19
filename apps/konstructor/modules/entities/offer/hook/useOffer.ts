import { useAppDispatch, useAppSelector } from '@/modules/app';
import { useOfferTemplate } from '../../offer-template';
import { IOffer } from '../type/offer.type';
import { v4 as uuidv4 } from 'uuid';
import { setCurrent } from '../model/OfferSlice';
import { useEffect } from 'react';
import { OfferTemplateDto } from '@workspace/nest-api';

export const useOffer = () => {
    const dispatch = useAppDispatch();
    const offer = useAppSelector(state => state.offer.current);
    const { current: offerTemplate } = useOfferTemplate();
    const infoblocks = useAppSelector(state => state.infoblock.groups);
    const complects = useAppSelector(state => state.complect.prof);

    const setOffer = () => {
        if (!offerTemplate || !infoblocks || !complects) return;
        const offer: IOffer = {
            id: uuidv4(),
            name: complects?.[0]?.name || 'Offer',
            template: offerTemplate as OfferTemplateDto,
            infoblocks: infoblocks,
            complects: complects,
            //   description: offerTemplate?.description,
            //   price: offerTemplate?.price,
            //   image: offerTemplate?.image,
        };
        dispatch(setCurrent(offer));
    };

    useEffect(() => {
        setOffer();
    }, [offerTemplate, infoblocks, complects]);

    return { offer, setOffer };
};
