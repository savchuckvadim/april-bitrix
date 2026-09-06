'use client';

import { AiAnalyticsAuditPanel } from '@/modules/entities/ai-analytics-audit';

/**
 * Раздел «AI-аналитика ОП → Аудит данных»: запуск аудита по порталу и
 * чтение снапшотов. Раздел админки виден всегда; портальные ограничения
 * (ai_analytics_enabled / ai_analytics_audit_enabled) показывает сама панель.
 */
export default function AiAnalyticsAuditPage() {
    return <AiAnalyticsAuditPanel />;
}
