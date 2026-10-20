'use client';

import { Suspense } from 'react';
import { AiAnalyticsGuidePage } from '@/modules/entities/ai-analytics-guide';

/**
 * Раздел «AI-аналитика ОП → Путеводитель»: теория и связи настроек,
 * параметров, базы знаний, ручек и страниц; формы «Запуск» по порталу.
 *
 * Suspense — граница для `useSearchParams` выбранного портала.
 */
export default function AiAnalyticsGuideRoutePage() {
    return (
        <Suspense fallback={null}>
            <AiAnalyticsGuidePage />
        </Suspense>
    );
}
