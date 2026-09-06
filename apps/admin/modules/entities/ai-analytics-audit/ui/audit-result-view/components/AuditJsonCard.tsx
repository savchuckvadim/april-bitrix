'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import { formatReportJson } from '../../../lib/audit-format.util';
import type { AiAnalyticsAuditReport } from '../../../model';

interface AuditJsonCardProps {
    report: AiAnalyticsAuditReport;
}

/** Структурированный отчёт как есть — свёрнутый JSON для сверки с ключами about.computes. */
export const AuditJsonCard = ({ report }: AuditJsonCardProps) => (
    <SectionCard
        title={AUDIT_TEXT.jsonTitle}
        density="compact"
        collapsible
        defaultOpen={false}
    >
        <pre className="max-h-[32rem] overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
            {formatReportJson(report)}
        </pre>
    </SectionCard>
);
