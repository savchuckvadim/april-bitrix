'use client';

import type { AiOwnerReport } from '@/modules/entities/ai-analytics';
import {
    AI_OWNER_REPORT_TEXT,
    aiOwnerReportGeneratedAt,
} from '../../lib/ai-owner-report.texts';
import { AiOwnerReportLeaks } from './AiOwnerReportLeaks';
import { AiOwnerReportManagement } from './AiOwnerReportManagement';
import { AiOwnerReportManagers } from './AiOwnerReportManagers';
import { AiOwnerReportMetrics } from './AiOwnerReportMetrics';
import { AiOwnerReportObjections } from './AiOwnerReportObjections';
import { AiOwnerReportOverview } from './AiOwnerReportOverview';
import { AiOwnerReportSection } from './AiOwnerReportSection';
import { AiOwnerReportSummary } from './AiOwnerReportSummary';
import { AiOwnerReportTiles } from './AiOwnerReportTiles';

interface AiOwnerReportBodyProps {
    report: AiOwnerReport;
}

const T = AI_OWNER_REPORT_TEXT;

/** Разделы отчёта в порядке подачи собственнику. */
export const AiOwnerReportBody = ({ report }: AiOwnerReportBodyProps) => {
    const { text } = report;
    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h3 className="text-base font-semibold">{text.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {text.periodLabel} · {T.generatedAt(aiOwnerReportGeneratedAt(report.generatedAt))}
                    {' · '}
                    {T.source[report.source]}
                </p>
            </header>
            <AiOwnerReportTiles tiles={text.tiles} />
            <AiOwnerReportSection title={T.sections.summary}>
                <AiOwnerReportSummary
                    paragraphs={text.summary}
                    source={text.summarySource}
                />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.overview}>
                <AiOwnerReportOverview overview={text.overview} />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.leaks}>
                <AiOwnerReportLeaks leaks={text.leaks} />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.management}>
                <AiOwnerReportManagement management={text.management} />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.objections}>
                <AiOwnerReportObjections
                    objections={text.objections}
                    issues={text.issues}
                />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.metrics}>
                <AiOwnerReportMetrics metrics={text.controlMetrics} />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.managers}>
                <AiOwnerReportManagers managers={text.managers} />
            </AiOwnerReportSection>
            <AiOwnerReportSection title={T.sections.methodology}>
                <div className="space-y-1">
                    {text.methodology.map(line => (
                        <p key={line} className="text-xs text-muted-foreground">
                            {line}
                        </p>
                    ))}
                </div>
            </AiOwnerReportSection>
        </div>
    );
};
