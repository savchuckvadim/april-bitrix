'use client';

import { createContext, useContext } from 'react';
import type { DigestTabKey } from './digest-tabs';

/**
 * Раскладка дайджеста для карточек виджетов: «Всё» — карточки сворачиваются
 * и помнят состояние; отдельная подвкладка — карточка раскрыта всегда.
 */
export interface DigestLayoutValue {
    mode: 'all' | 'single';
    openTab: (tab: DigestTabKey) => void;
}

const DigestLayoutContext = createContext<DigestLayoutValue>({
    mode: 'single',
    openTab: () => undefined,
});

export const DigestLayoutProvider = DigestLayoutContext.Provider;

export const useDigestLayout = (): DigestLayoutValue => useContext(DigestLayoutContext);
