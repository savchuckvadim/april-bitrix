'use client';

import { Suspense } from 'react';
import { MethodologiesPage } from '@/modules/entities/methodologies';

/**
 * Раздел «AI-аналитика ОП → Методики продаж»: общие методики April и свои
 * методики порталов, редактор-бриф с помощником по документу.
 */
export default function MethodologiesRoutePage() {
    return (
        <Suspense fallback={null}>
            <MethodologiesPage />
        </Suspense>
    );
}
