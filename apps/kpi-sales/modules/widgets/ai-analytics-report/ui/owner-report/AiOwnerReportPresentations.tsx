'use client';

import type { AiOwnerReportText } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportPresentationsProps {
    presentations: AiOwnerReportText['presentations'];
}

const T = AI_OWNER_REPORT_TEXT;
const C = T.columns;

const KeyValueTable = ({
    rows,
}: {
    rows: AiOwnerReportText['presentations']['rows'];
}) => (
    <table className="w-full border-collapse">
        <thead>
            <tr>
                <th className={headClass}>{C.indicator}</th>
                <th className={`${headClass} text-right`}>{C.value}</th>
            </tr>
        </thead>
        <tbody>
            {rows.map(row => (
                <tr key={row.label} className="border-t border-border/40">
                    <td className={cellClass}>{row.label}</td>
                    <td className={`${cellClass} text-right tabular-nums`}>
                        {row.value}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

/**
 * «Презентации»: сводка показов, пара «под задачи клиента против
 * шаблонного», что видно в показах, средние оценки разделов, у кого показ
 * двигает клиента чаще и реже всего.
 */
export const AiOwnerReportPresentations = ({
    presentations,
}: AiOwnerReportPresentationsProps) => (
    <div className="space-y-3">
        <p className="text-xs">{presentations.intro}</p>
        {presentations.comparison && (
            <div className="rounded-md border border-l-4 border-l-success bg-background/40 p-3">
                <div className="text-xs font-semibold">
                    {T.presentations.comparisonTitle}
                </div>
                <p className="mt-1 text-xs">{presentations.comparison}</p>
            </div>
        )}
        {presentations.rows.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
                <div>
                    <h5 className="mb-1 text-xs font-medium">
                        {T.sections.presentationRows}
                    </h5>
                    <KeyValueTable rows={presentations.rows} />
                </div>
                {presentations.sections.length > 0 && (
                    <div>
                        <h5 className="mb-1 text-xs font-medium">
                            {T.sections.presentationSections}
                        </h5>
                        <KeyValueTable rows={presentations.sections} />
                    </div>
                )}
            </div>
        )}
        {presentations.people && (
            <p className="text-xs text-muted-foreground">{presentations.people}</p>
        )}
    </div>
);
