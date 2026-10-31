'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import { validateLt, validateLtOther } from '@/modules/entities/composition';
import { selectMainRow, selectRowSetContext } from '@/modules/entities/row-set';
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
    const catalog = useAppSelector(selectCatalog);
    const { serviceDepartment, regionCode } = useAppSelector(selectRowSetContext);
    const hasMainRow = Boolean(mainRow);

    // несобранный пакет LT сборку не останавливает, но сервисы в КП идут списком, а товара за них нет
    const ltWarnings = useMemo(() => {
        const composition = mainRow?.composition;
        const complect = composition ? catalog.complects.byCode[composition.complectCode] : null;
        if (!composition || !complect) return [];
        const ctx = { catalog, complect, regionCode, serviceDepartment };
        return [...validateLt(composition, ctx), ...validateLtOther(composition, ctx)].map(item => item.message);
    }, [mainRow, catalog, regionCode, serviceDepartment]);

    return {
        hasMainRow,
        ltWarnings,
        documents: DOCUMENT_KINDS,
        toComplect: () => nav.to(ROUTE_KONSTRUCTOR.COMPLECT),
        toPrices: () => nav.to(ROUTE_KONSTRUCTOR.PRICES),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
        openDocument: (kind: DocumentKind) => nav.toDocument(kind),
    };
};
