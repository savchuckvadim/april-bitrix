'use client';

import type { FC, ReactNode } from 'react';
import { SectionContext } from './section-context';
import type { SectionDefinition } from './section-definition';

interface SectionProviderProps {
    definition: SectionDefinition;
    children: ReactNode;
}

/** Отдаёт определение раздела всем компонентам рамы ниже по дереву. */
export const SectionProvider: FC<SectionProviderProps> = ({
    definition,
    children,
}) => (
    <SectionContext.Provider value={definition}>
        {children}
    </SectionContext.Provider>
);
