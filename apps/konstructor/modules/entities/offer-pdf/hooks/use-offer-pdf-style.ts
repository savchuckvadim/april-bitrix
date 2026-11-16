'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { resolvePalette } from '../lib/offer-pdf-palette.util';
import { offerPdfActions, selectOfferPdfPrefs } from '../model/OfferPdfSlice';
import { useOfferPdfTemplates } from './use-offer-pdf-templates';

/**
 * Выбранный стиль и гамма — общий для экрана КП и витрины стилей. Выбор
 * живёт в сторе (offerPdf), список стилей — в кэше вкладки. Сохранённого
 * стиля в списке нет — берём первый доступный.
 */
export const useOfferPdfStyle = (enabled = true) => {
    const dispatch = useAppDispatch();
    const prefs = useAppSelector(selectOfferPdfPrefs);
    const { templates, loading, error } = useOfferPdfTemplates(enabled);

    const template = useMemo(
        () => templates.find(item => item.code === prefs.templateCode) ?? templates[0] ?? null,
        [templates, prefs.templateCode],
    );

    /** Стиль; без гаммы — его первая */
    const select = useCallback(
        (templateCode: string, palette: string | null = null) =>
            dispatch(offerPdfActions.selectStyle({ templateCode, palette })),
        [dispatch],
    );
    const setPalette = useCallback((palette: string) => dispatch(offerPdfActions.setPalette(palette)), [dispatch]);

    return {
        templates,
        loading,
        error,
        template,
        templateCode: template?.code ?? prefs.templateCode,
        palette: resolvePalette(template, prefs.palette),
        select,
        setPalette,
    };
};
