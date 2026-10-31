'use client';

import { useMemo, useState } from 'react';
import type { Catalog } from '@/modules/entities/catalog';
import type { Composition } from '@/modules/entities/composition';
import {
    buildCompositionSections,
    describeSection,
} from '../lib/composition-sections.util';

/**
 * Категории наполнения для всех видов: отметки и метки веса, сворачивание
 * (вид «Карточки»: свёрнутая показывает только отмеченное, по умолчанию всё
 * свёрнуто) и фильтр «только выбранные» (вид «Плотно»).
 */
export const useCompositionSections = (
    catalog: Catalog,
    composition: Composition | null,
    showWeights: boolean,
) => {
    const sections = useMemo(() => buildCompositionSections(catalog), [catalog]);
    const [openCodes, setOpenCodes] = useState<string[]>([]);
    const [onlyChecked, setOnlyChecked] = useState(false);

    const view = sections.map(section => {
        const described = describeSection(section, composition, showWeights);
        const isOpen = openCodes.includes(section.code);
        return {
            ...described,
            isOpen,
            visibleItems: isOpen ? described.items : described.checkedItems,
        };
    });

    const isAllOpen = sections.length > 0 && openCodes.length === sections.length;

    return {
        sections: view,
        isAllOpen,
        onlyChecked,
        toggleOnlyChecked: () => setOnlyChecked(prev => !prev),
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
