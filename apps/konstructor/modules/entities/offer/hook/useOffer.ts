import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { useOfferTemplate } from '../../offer-template';
import { IOffer } from '../type/offer.type';
import { v4 as uuidv4 } from 'uuid';
import { setCurrent } from '../model/OfferSlice';
import { useEffect } from 'react';
import { OfferTemplateDto } from '@workspace/nest-api';
import { selectCatalog } from '@/modules/entities/catalog';
import type { IComplect } from '@/modules/entities/complect';
import type { IInfoBlockGroup } from '@/modules/entities/infoblock';

/**
 * Данные для оффера теперь берутся из каталога (code-джойны) и приводятся
 * к легаси-типам offer-стека. TODO: перевести offer-стек на типы каталога.
 */
export const useOffer = () => {
    const dispatch = useAppDispatch();
    const offer = useAppSelector(state => state.offer.current);
    const { current: offerTemplate } = useOfferTemplate();
    const catalog = useAppSelector(selectCatalog);

    const infoblocks = useMemo<IInfoBlockGroup[]>(
        () =>
            catalog.groups.map(group => ({
                id: group.code,
                code: group.code,
                name: group.name,
                title: group.name,
                type: group.type,
                infoblocks: group.infoblockCodes
                    .map(code => catalog.infoblocks[code])
                    .filter(Boolean)
                    .map(block => ({
                        id: block!.code,
                        name: block!.name,
                        title: block!.name,
                        code: block!.code,
                        groupId: group.code,
                        description: block!.description ?? '',
                        descriptionForSale: '',
                        shortDescription: block!.shortDescription ?? '',
                        checked: false,
                    })),
            })) as unknown as IInfoBlockGroup[],
        [catalog],
    );

    const complects = useMemo<IComplect[]>(
        () =>
            catalog.complects.prof.map(complect => ({
                number: complect.number,
                name: complect.title,
                fullName: complect.fullTitle,
                shortName: complect.shortTitle,
                abs: complect.abs ?? false,
                weight: complect.weight,
                type: complect.type,
                withConsalting: complect.withConsalting,
                isChanging: complect.isChanging,
            })) as unknown as IComplect[],
        [catalog],
    );

    const setOffer = () => {
        if (!offerTemplate) return;
        const offer: IOffer = {
            id: uuidv4(),
            name: complects?.[0]?.name || 'Offer',
            template: offerTemplate as OfferTemplateDto,
            infoblocks: infoblocks,
            complects: complects,
        };
        dispatch(setCurrent(offer));
    };

    useEffect(() => {
        setOffer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerTemplate, infoblocks, complects]);

    return { offer, setOffer };
};
