'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import { validateAcademy, validateLt, validateLtOther } from '@/modules/entities/composition';
import {
    selectGeneralSet,
    selectMainRow,
    selectRowSetContext,
    setTermMonths,
} from '@/modules/entities/row-set';
import {
    DOCUMENT_KINDS,
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
    type DocumentKind,
} from '@/modules/shared/lib/routing';

/**
 * Хаб сделки и шаг «Документ»: какой документ делать; сводка сборки с
 * переходами к комплекту и ценам — в саммари справа.
 */
export const useDocumentHub = () => {
    const nav = useKonstructorNavigation();
    const mainRow = useAppSelector(selectMainRow);
    const general = useAppSelector(selectGeneralSet);
    const catalog = useAppSelector(selectCatalog);
    const { serviceDepartment, regionCode } = useAppSelector(selectRowSetContext);
    const hasMainRow = Boolean(mainRow);

    // несобранный пакет LT и академия не под срок сборку не останавливают, но
    // товара за них нет: сервисы LT в КП идут списком, академии в документах не будет
    const compositionWarnings = useMemo(() => {
        const composition = mainRow?.composition;
        const complect = composition ? catalog.complects.byCode[composition.complectCode] : null;
        if (!composition || !complect) return [];
        const ctx = {
            catalog,
            complect,
            regionCode,
            serviceDepartment,
            termMonths: setTermMonths(general, catalog),
        };
        return [
            ...validateLt(composition, ctx),
            ...validateLtOther(composition, ctx),
            ...validateAcademy(composition, ctx),
        ].map(item => item.message);
    }, [mainRow, general, catalog, regionCode, serviceDepartment]);

    return {
        hasMainRow,
        compositionWarnings,
        documents: DOCUMENT_KINDS,
        toComplect: () => nav.to(ROUTE_KONSTRUCTOR.COMPLECT),
        toPrices: () => nav.to(ROUTE_KONSTRUCTOR.PRICES),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
        openDocument: (kind: DocumentKind) => nav.toDocument(kind),
    };
};
