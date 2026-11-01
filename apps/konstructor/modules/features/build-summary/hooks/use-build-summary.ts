'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import {
    selectAlternativeSets,
    selectGeneralSet,
    selectMainRow,
    selectRowSetContext,
} from '@/modules/entities/row-set';
import {
    buildSummaryFacts,
    buildSummaryTotal,
} from '../lib/build-summary.util';

/**
 * Сводка текущей сборки для саммари шагов и хаба документов. Итог считается
 * здесь в useMemo: селектор итога собирал бы новую строку на каждый вызов.
 */
export const useBuildSummary = () => {
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const general = useAppSelector(selectGeneralSet);
    const mainRow = useAppSelector(selectMainRow);
    const comparisonCount = useAppSelector(selectAlternativeSets).length;

    // пакет академии выбран, но под срок сделки не подходит — строки в наборе нет
    const hasAcademyRow = general.rows.some(row => row.productType === 'academy');
    const facts = useMemo(
        () =>
            mainRow
                ? buildSummaryFacts(catalog, context, mainRow, comparisonCount, hasAcademyRow)
                : [],
        [catalog, context, mainRow, comparisonCount, hasAcademyRow],
    );
    const total = useMemo(
        () => buildSummaryTotal(general, context.withTax),
        [general, context.withTax],
    );

    return { hasMainRow: Boolean(mainRow), facts, total };
};
