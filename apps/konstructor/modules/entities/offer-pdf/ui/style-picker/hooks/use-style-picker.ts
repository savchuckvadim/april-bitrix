'use client';

import { useMemo } from 'react';
import { resolvePalette, templatePalettes } from '../../../lib/offer-pdf-palette.util';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';

/**
 * Сетка стилей: у выбранного миниатюра в выбранной гамме, у остальных — в
 * первой (тот же ключ кэша, что после выбора, — второй раз не собираем).
 */
export const useStylePicker = () => {
    const {
        templates,
        templatesLoading,
        templatesError,
        templateCode,
        setTemplateCode,
        template,
        palette,
        setPalette,
    } = useOfferPdfDocument();

    const cards = useMemo(
        () =>
            templates.map(item => {
                const selected = item.code === templateCode;
                return { template: item, selected, palette: selected ? palette : resolvePalette(item, null) };
            }),
        [templates, templateCode, palette],
    );

    return {
        loading: templatesLoading,
        error: templatesError,
        cards,
        select: setTemplateCode,
        palettes: templatePalettes(template),
        palette,
        setPalette,
        description: template?.description ?? null,
    };
};
