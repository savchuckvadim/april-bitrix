'use client';

import { useCallback, useContext } from 'react';
import { SectionContext } from '../section/section-context';
import { sectionTabPath } from '../section/section-definition';

/** Определение текущего раздела и построитель путей его вкладок. */
export const useSection = () => {
    const definition = useContext(SectionContext);

    const tabPath = useCallback(
        (slug: string) => sectionTabPath(definition, slug),
        [definition],
    );

    return { definition, tabs: definition.tabs, tabPath };
};
