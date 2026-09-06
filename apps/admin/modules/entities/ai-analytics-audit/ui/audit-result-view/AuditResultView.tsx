'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import {
    AUDIT_SOURCE_LABEL,
    AUDIT_TEXT,
} from '../../consts/ai-analytics-audit.const';
import { buildTotalTiles } from '../../lib/audit-report.catalog';
import type { AiAnalyticsAuditResult } from '../../model';
import { AuditJsonCard } from './components/AuditJsonCard';
import { AuditMarkdownCard } from './components/AuditMarkdownCard';
import { AuditRecommendationCard } from './components/AuditRecommendationCard';
import { AuditResultHeader } from './components/AuditResultHeader';
import { AuditTotalsCards } from './components/AuditTotalsCards';

interface AuditResultViewProps {
    result: AiAnalyticsAuditResult;
}

/**
 * Результат аудита — свежий расчёт или снапшот одним компонентом:
 * шапка, плитки итогов, рекомендация, markdown, JSON.
 */
export const AuditResultView = ({ result }: AuditResultViewProps) => (
    <SectionCard
        title={AUDIT_TEXT.resultTitle}
        tone="primary"
        accent
        actions={
            <>
                <ToneBadge
                    tone={result.fromSnapshot ? 'info' : 'success'}
                    variant="soft"
                >
                    {result.fromSnapshot
                        ? AUDIT_TEXT.resultSnapshot
                        : AUDIT_TEXT.resultFresh}
                </ToneBadge>
                <ToneBadge tone="neutral" variant="outline">
                    {AUDIT_SOURCE_LABEL[result.source]}
                </ToneBadge>
            </>
        }
        contentClassName="space-y-5"
    >
        <AuditResultHeader result={result} />
        <AuditTotalsCards tiles={buildTotalTiles(result.report)} />
        <AuditRecommendationCard
            recommendation={result.report.recommendation}
            rules={result.report.rules}
        />
        <AuditMarkdownCard markdown={result.markdown} />
        <AuditJsonCard report={result.report} />
    </SectionCard>
);
