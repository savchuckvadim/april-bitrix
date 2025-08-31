import { useAppDispatch, useAppSelector } from '@/modules/app';
import { IOfferTemplate } from '../type/offer-template.type';
import { setCurrent } from '../model/OfferTemplateSlice';

export const useOfferTemplate = () => {
    const current = useAppSelector(state => state.offerTemplate.current);
    const items = useAppSelector(state => state.offerTemplate.items);
    const dispatch = useAppDispatch();
    return {
        current,
        items,
        setCurrent: (current: IOfferTemplate) => dispatch(setCurrent(current)),
    };
};
