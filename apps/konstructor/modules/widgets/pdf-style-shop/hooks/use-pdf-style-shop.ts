'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { resolvePalette, templatePalettes, useOfferPdfStyle } from '@/modules/entities/offer-pdf';
import { useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Витрина стилей PDF-КП: у выбранного стиля миниатюра в выбранной гамме, у
 * остальных — в первой. Выбор сразу уходит в КП (и в последний выбор
 * менеджера), страница остаётся открытой — как у витрины Word-шаблонов.
 */
export const usePdfStyleShop = () => {
    const style = useOfferPdfStyle();
    const nav = useKonstructorNavigation();
    const { templates, templateCode, palette, select, setPalette } = style;

    const cards = useMemo(
        () =>
            templates.map(item => {
                const selected = item.code === templateCode;
                return {
                    template: item,
                    selected,
                    palette: selected ? palette : resolvePalette(item, null),
                    palettes: templatePalettes(item),
                };
            }),
        [templates, templateCode, palette],
    );

    const announce = (code: string) => {
        const name = templates.find(item => item.code === code)?.name ?? code;
        toast.success(`Стиль «${name}» выбран для КП`);
    };

    return {
        loading: style.loading,
        error: style.error,
        cards,
        /** Клик по карточке: другой стиль — с первой гаммой, свой — без изменений */
        pick: (code: string) => {
            if (code === templateCode) return;
            select(code);
            announce(code);
        },
        /** Кружок гаммы на карточке: выбирает и стиль, если он ещё не выбран */
        pickPalette: (code: string, next: string) => {
            if (code === templateCode) {
                setPalette(next);
                return;
            }
            select(code, next);
            announce(code);
        },
        back: nav.back,
    };
};
