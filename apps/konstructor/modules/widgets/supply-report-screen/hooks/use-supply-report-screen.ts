'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectMainRow } from '@/modules/entities/row-set';
import { initSupplyReport } from '@/modules/entities/supply-report-document';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/** Экран отчёта о поставке: на входе — поля сделки, спецификация, форма, контакты, заявка RPA. */
export const useSupplyReportScreen = () => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const catalogReady = useAppSelector(state => state.catalog.loading === 'succeeded');
    const portalReady = useAppSelector(state => Boolean(state.portal.current));

    useEffect(() => {
        if (hasMainRow && catalogReady && portalReady) void dispatch(initSupplyReport());
    }, [hasMainRow, catalogReady, portalReady, dispatch]);

    return {
        hasMainRow,
        toHub: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
    };
};
