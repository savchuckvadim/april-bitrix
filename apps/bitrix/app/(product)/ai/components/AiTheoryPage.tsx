'use client';

import type { FC } from 'react';
import { TheoryPageView } from '../../process/_core/components/theory/TheoryPageView';
import type { TheoryPageContent } from '../../process/_core/theory-types';
import { AI_SECTION } from '../constants/section';

/** Глава базы знаний AI в раме раздела AI. */
export const AiTheoryPage: FC<{ page: TheoryPageContent }> = ({ page }) => (
    <TheoryPageView page={page} definition={AI_SECTION} />
);
