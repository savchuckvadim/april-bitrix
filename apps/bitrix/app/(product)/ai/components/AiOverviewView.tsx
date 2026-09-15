'use client';

import type { FC } from 'react';
import { TheoryOverviewView } from '../../process/_core/components/theory/TheoryOverviewView';
import { AI_OVERVIEW_NAV_TITLE } from '../constants/copy';
import { AI_OVERVIEW } from '../constants/pages/overview';
import { AI_SECTION } from '../constants/section';

/** Обзор базы знаний AI: «о документе» и карта разделов. */
export const AiOverviewView: FC = () => (
    <TheoryOverviewView
        page={AI_OVERVIEW}
        navTitle={AI_OVERVIEW_NAV_TITLE}
        definition={AI_SECTION}
    />
);
