'use client';

import { createContext } from 'react';
import { SALES_SECTION } from '../constants/views';
import type { SectionDefinition } from './section-definition';

/**
 * Текущий раздел рамы. По умолчанию — раздел продаж: так компоненты, которые
 * исторически читали `SALES_TABS` напрямую, ведут себя как раньше и без
 * провайдера.
 */
export const SectionContext = createContext<SectionDefinition>(SALES_SECTION);
