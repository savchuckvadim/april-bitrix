'use client';

import { FeatureDisabledScreen, useFeature } from '@/modules/app';
import { AiAnalyticsAuditPanel } from '@/modules/entities/ai-analytics-audit';

/**
 * Раздел «AI-аналитика ОП → Аудит данных»: запуск аудита по порталу и
 * чтение снапшотов. Выключенный фич-флаг показывает заглушку.
 */
export default function AiAnalyticsAuditPage() {
    const isEnabled = useFeature('aiAnalytics');

    if (!isEnabled) {
        return <FeatureDisabledScreen title="AI-аналитика ОП" />;
    }
    return <AiAnalyticsAuditPanel />;
}
