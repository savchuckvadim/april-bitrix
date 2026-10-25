'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectZakupkiEnabled } from '@/modules/entities/app-settings';
import { initOfferDocument } from '@/modules/entities/offer-document';
import { selectMainRow } from '@/modules/entities/row-set';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Экран КП: на входе — дефолты шапки из сделки и Word-шаблоны пользователя;
 * без главной строки экран не имеет смысла — отправляем собирать комплект.
 */
export const useOfferDocumentScreen = () => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const templatesLoading = useAppSelector(state => state.offerTemplateWord.isLoading);
    // «3 КП для торгов» — по портальному флагу (легаси: только april-garant)
    const zakupkiEnabled = useAppSelector(selectZakupkiEnabled);

    useEffect(() => {
        if (hasMainRow) void dispatch(initOfferDocument());
    }, [hasMainRow, dispatch]);

    return {
        hasMainRow,
        templatesLoading,
        zakupkiEnabled,
        toHub: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
    };
};
