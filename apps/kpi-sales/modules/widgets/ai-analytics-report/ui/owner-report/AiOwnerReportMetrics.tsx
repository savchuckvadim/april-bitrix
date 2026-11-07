'use client';

import type { AiOwnerReportMetric } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportMetricsProps {
    metrics: AiOwnerReportMetric[];
}

const C = AI_OWNER_REPORT_TEXT.columns;

/** Пять метрик для контроля: значение, последняя неделя, почему важно. */
export const AiOwnerReportMetrics = ({ metrics }: AiOwnerReportMetricsProps) => (
    <table className="w-full border-collapse">
        <thead>
            <tr>
                <th className={headClass}>{C.metric}</th>
                <th className={headClass}>{C.value}</th>
                <th className={headClass}>{C.lastWeek}</th>
                <th className={headClass}>{C.why}</th>
                <th className={headClass}>{C.ifIgnored}</th>
            </tr>
        </thead>
        <tbody>
            {metrics.map(metric => (
                <tr key={metric.code} className="border-t border-border/40">
                    <td className={`${cellClass} font-medium`}>{metric.title}</td>
                    <td className={`${cellClass} tabular-nums`}>{metric.value}</td>
                    <td className={`${cellClass} tabular-nums`}>{metric.lastWeek ?? '—'}</td>
                    <td className={`${cellClass} text-muted-foreground`}>{metric.why}</td>
                    <td className={`${cellClass} text-muted-foreground`}>{metric.ifIgnored}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
