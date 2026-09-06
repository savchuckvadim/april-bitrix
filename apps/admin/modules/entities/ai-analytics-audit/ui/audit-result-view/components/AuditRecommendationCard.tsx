'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import {
    buildRecommendationFlags,
    describeAuditRules,
} from '../../../lib/audit-report.catalog';
import type {
    AiAnalyticsAuditRecommendation,
    AiAnalyticsAuditRules,
} from '../../../model';

interface AuditRecommendationCardProps {
    recommendation: AiAnalyticsAuditRecommendation;
    rules: AiAnalyticsAuditRules;
}

/**
 * Рекомендация по порогам: флаги бэйджами (warning — нужно действие),
 * строки вывода списком, пороги правила — подписью.
 */
export const AuditRecommendationCard = ({
    recommendation,
    rules,
}: AuditRecommendationCardProps) => {
    const flags = buildRecommendationFlags(recommendation);
    const needsAction = flags.some(flag => flag.tone === 'warning');

    return (
        <SectionCard
            title={AUDIT_TEXT.recommendationTitle}
            tone={needsAction ? 'warning' : 'success'}
            accent
            density="compact"
        >
            <div className="flex flex-wrap gap-2">
                {flags.map(flag => (
                    <ToneBadge key={flag.key} tone={flag.tone} variant="soft">
                        {flag.label}
                    </ToneBadge>
                ))}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
                {recommendation.lines.map(line => (
                    <li key={line}>{line}</li>
                ))}
            </ul>
            <p className="text-xs text-muted-foreground">
                {AUDIT_TEXT.recommendationRules}:{' '}
                {describeAuditRules(rules).join('; ')}.
            </p>
        </SectionCard>
    );
};
