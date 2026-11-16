'use client';

import { useMemo } from 'react';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';
import { templatePalettes } from '../../../lib/offer-pdf-palette.util';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';

/** Текущий стиль на экране КП: быстрый выбор чипами, полный — на витрине стилей */
export const useCurrentStyle = () => {
    const doc = useOfferPdfDocument();
    const nav = useKonstructorNavigation();

    const options = useMemo(
        () => doc.templates.map(item => ({ value: item.code, label: item.name })),
        [doc.templates],
    );

    return {
        loading: doc.templatesLoading,
        error: doc.templatesError,
        template: doc.template,
        templateCode: doc.templateCode,
        palette: doc.palette,
        palettes: templatePalettes(doc.template),
        options,
        select: (code: string) => doc.selectStyle(code),
        setPalette: doc.setPalette,
        // витрина — отдельная страница, как у Word-шаблонов; «Назад» там вернёт к КП
        openShop: () => nav.to(ROUTE_KONSTRUCTOR.PDF_STYLES),
    };
};
