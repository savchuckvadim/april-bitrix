'use client';

import { useAppSelector } from '@/modules/app';
import { selectMainRow } from '@/modules/entities/row-set';
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
    const hasMainRow = Boolean(useAppSelector(selectMainRow));

    return {
        hasMainRow,
        documents: DOCUMENT_KINDS,
        toComplect: () => nav.to(ROUTE_KONSTRUCTOR.COMPLECT),
        toPrices: () => nav.to(ROUTE_KONSTRUCTOR.PRICES),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
        openDocument: (kind: DocumentKind) => nav.toDocument(kind),
    };
};
