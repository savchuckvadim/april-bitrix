'use client';

import { useMemo, useState } from 'react';
import { getComplectRuleFlags, type Catalog } from '@/modules/entities/catalog';
import type { Composition } from '@/modules/entities/composition';
import {
    buildCompositionSections,
    describeSection,
} from '../lib/composition-sections.util';

/**
 * Категории наполнения для всех видов: отметки и метки веса, сворачивание
 * (свёрнутая категория показывает только отмеченное) и фильтр «только
 * выбранные» (вид «Плотно»). Исходное состояние категорий задаёт вид:
 * «Карточки» свёрнуты, «Классика» раскрыта; смена вида сбрасывает ручные
 * переключения — список переключённых хранится вместе с видом, для которого
 * его делали.
 */
export const useCompositionSections = (
    catalog: Catalog,
    composition: Composition | null,
    showWeights: boolean,
    defaultOpen: boolean,
) => {
    const sections = useMemo(() => buildCompositionSections(catalog), [catalog]);
    const [toggled, setToggled] = useState<{ base: boolean; codes: string[] }>({
        base: defaultOpen,
        codes: [],
    });
    const [onlyChecked, setOnlyChecked] = useState(false);
    const toggledCodes = toggled.base === defaultOpen ? toggled.codes : [];
    const isOpen = (code: string) => defaultOpen !== toggledCodes.includes(code);

    const complect = composition ? catalog.complects.byCode[composition.complectCode] : null;
    const pinnedLt = complect ? (getComplectRuleFlags(complect).pinnedLt ?? null) : null;

    const view = sections.map(section => {
        const described = describeSection(section, composition, showWeights, pinnedLt);
        const open = isOpen(section.code);
        return {
            ...described,
            isOpen: open,
            visibleItems: open ? described.items : described.checkedItems,
        };
    });

    const allCodes = sections.map(section => section.code);
    const isAllOpen = sections.length > 0 && allCodes.every(isOpen);

    return {
        sections: view,
        isAllOpen,
        onlyChecked,
        toggleOnlyChecked: () => setOnlyChecked(prev => !prev),
        toggleSection: (code: string) =>
            setToggled({
                base: defaultOpen,
                codes: toggledCodes.includes(code)
                    ? toggledCodes.filter(item => item !== code)
                    : [...toggledCodes, code],
            }),
        toggleAll: () =>
            setToggled({
                base: defaultOpen,
                codes: isAllOpen === defaultOpen ? allCodes : [],
            }),
    };
};
