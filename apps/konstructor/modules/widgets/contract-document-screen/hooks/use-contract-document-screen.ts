'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { initContractDocument } from '@/modules/entities/contract-document';
import { selectMainRow } from '@/modules/entities/row-set';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Экран договора: на входе — поля сделки из Bitrix и форма с бэка по текущей
 * сборке; без главной строки экран не имеет смысла.
 */
export const useContractDocumentScreen = () => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const catalogReady = useAppSelector(state => state.catalog.loading === 'succeeded');

    useEffect(() => {
        if (hasMainRow && catalogReady) void dispatch(initContractDocument());
    }, [hasMainRow, catalogReady, dispatch]);

    return {
        hasMainRow,
        toHub: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
    };
};
