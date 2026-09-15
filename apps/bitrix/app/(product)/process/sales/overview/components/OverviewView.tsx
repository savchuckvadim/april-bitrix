'use client';

import type { FC } from 'react';
import { TheoryOverviewView } from '../../../_core/components/theory/TheoryOverviewView';
import { SALES_OVERVIEW, SALES_OVERVIEW_NAV_TITLE } from '../constants/overview';

/**
 * Обзорная страница раздела продаж: общий обзорный вид в раме раздела
 * продаж (дефолт рамы), с карточками «с чего начать» в конце.
 */
export const OverviewView: FC = () => (
    <TheoryOverviewView
        page={SALES_OVERVIEW}
        navTitle={SALES_OVERVIEW_NAV_TITLE}
    />
);
