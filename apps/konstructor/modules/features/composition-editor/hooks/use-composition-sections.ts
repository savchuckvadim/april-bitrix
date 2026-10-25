'use client';

import { useMemo, useState } from 'react';
import type { Catalog } from '@/modules/entities/catalog';
import type { Composition } from '@/modules/entities/composition';
import {
    buildCompositionSections,
    isSectionItemChecked,
} from '../lib/composition-sections.util';

/**
 * Категории наполнения со сворачиванием. Свёрнутая категория показывает
 * только отмеченное — инфоблоков много, и список не должен уходить на
 * несколько экранов вниз. По умолчанию всё свёрнуто.
 */
export const useCompositionSections = (
    catalog: Catalog,
    composition: Composition | null,
) => {
    const sections = useMemo(() => buildCompositionSections(catalog), [catalog]);
    const [openCodes, setOpenCodes] = useState<string[]>([]);

    const view = sections.map(section => {
        const isOpen = openCodes.includes(section.code);
        const isChecked = (code: string) =>
            composition !== null &&
            isSectionItemChecked(composition, section.kind, code);
        const checked = section.items.filter(item => isChecked(item.code));
        return {
            ...section,
            isOpen,
            checkedCount: checked.length,
            visibleItems: isOpen ? section.items : checked,
            isChecked,
        };
    });

    const isAllOpen = sections.length > 0 && openCodes.length === sections.length;

    return {
        sections: view,
        isAllOpen,
        toggleSection: (code: string) =>
            setOpenCodes(prev =>
                prev.includes(code)
                    ? prev.filter(item => item !== code)
                    : [...prev, code],
            ),
        toggleAll: () =>
            setOpenCodes(
                isAllOpen ? [] : sections.map(section => section.code),
            ),
    };
};
