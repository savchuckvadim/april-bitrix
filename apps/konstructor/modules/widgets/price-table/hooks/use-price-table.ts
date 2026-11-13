'use client';

import { useState } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectCatalogReady } from '@/modules/entities/catalog';
import {
    canAddComparisonSet,
    selectAlternativeSets,
    selectGeneralSet,
    selectMainRow,
} from '@/modules/entities/row-set';
import type { RowBuilderTarget } from '@/modules/features/row-builder';

/**
 * Данные шага «Цены»: сеты, готовность каталога и мастер добавления — он
 * открывается под заголовком того раздела, где нажали «+».
 */
export const usePriceTable = () => {
    const catalogReady = useAppSelector(selectCatalogReady);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);
    const mainRow = useAppSelector(selectMainRow);
    const [builderTarget, setBuilderTarget] = useState<RowBuilderTarget | null>(null);

    return {
        catalogReady,
        general,
        alternative,
        mainRow,
        canAddComparison: canAddComparisonSet(alternative),
        builderTarget,
        /** Повторное нажатие той же «+» закрывает мастер */
        toggleBuilder: (target: RowBuilderTarget) =>
            setBuilderTarget(current => (current === target ? null : target)),
        closeBuilder: () => setBuilderTarget(null),
    };
};
