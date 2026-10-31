'use client';

import { useAppSelector } from '@/modules/app';
import { selectCatalogReady } from '@/modules/entities/catalog';
import {
    selectAlternativeSets,
    selectGeneralSet,
    selectMainRow,
} from '@/modules/entities/row-set';

/** Данные шага «Цены»: сеты и готовность каталога */
export const usePriceTable = () => {
    const catalogReady = useAppSelector(selectCatalogReady);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);
    const mainRow = useAppSelector(selectMainRow);

    return {
        catalogReady,
        general,
        alternative,
        mainRow,
    };
};
