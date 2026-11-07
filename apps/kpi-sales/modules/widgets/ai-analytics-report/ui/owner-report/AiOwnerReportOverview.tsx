'use client';

import type { AiOwnerReportText } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportOverviewProps {
    overview: AiOwnerReportText['overview'];
}

const T = AI_OWNER_REPORT_TEXT;
const C = T.columns;

/** Общая картина: исходы, виды разговоров, недели и пометки. */
export const AiOwnerReportOverview = ({ overview }: AiOwnerReportOverviewProps) => (
    <div className="grid gap-4 lg:grid-cols-2">
        <div>
            <h5 className="mb-1 text-xs font-medium">{T.sections.outcomes}</h5>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{C.outcome}</th>
                        <th className={`${headClass} text-right`}>{C.calls}</th>
                        <th className={`${headClass} text-right`}>{C.share}</th>
                    </tr>
                </thead>
                <tbody>
                    {overview.outcomes.map(row => (
                        <tr key={row.label} className="border-t border-border/40">
                            <td className={cellClass}>{row.label}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.calls}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.pct}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div>
            <h5 className="mb-1 text-xs font-medium">{T.sections.typeGroups}</h5>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{C.typeGroup}</th>
                        <th className={`${headClass} text-right`}>{C.calls}</th>
                        <th className={headClass}>{C.advanced}</th>
                        <th className={`${headClass} text-right`}>{C.callbackDated}</th>
                        <th className={`${headClass} text-right`}>{C.postponed}</th>
                        <th className={`${headClass} text-right`}>{C.refused}</th>
                        <th className={`${headClass} text-right`}>{C.noContact}</th>
                    </tr>
                </thead>
                <tbody>
                    {overview.typeGroups.map(row => (
                        <tr key={row.label} className="border-t border-border/40">
                            <td className={cellClass}>{row.label}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.calls}</td>
                            <td className={`${cellClass} tabular-nums`}>{row.advanced}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.callbackDated}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.postponed}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.refused}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.noContact}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="lg:col-span-2">
            <h5 className="mb-1 text-xs font-medium">{T.sections.weeks}</h5>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{C.week}</th>
                        <th className={`${headClass} text-right`}>{C.calls}</th>
                        <th className={`${headClass} text-right`}>{C.cold}</th>
                        <th className={headClass}>{C.coldAdvanced}</th>
                        <th className={`${headClass} text-right`}>{C.contacted}</th>
                        <th className={headClass}>{C.contactedAdvanced}</th>
                        <th className={headClass}>{C.note}</th>
                    </tr>
                </thead>
                <tbody>
                    {overview.weeks.map(row => (
                        <tr key={row.label} className="border-t border-border/40">
                            <td className={cellClass}>{row.label}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.calls}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.cold}</td>
                            <td className={`${cellClass} tabular-nums`}>{row.coldAdvanced}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.contacted}</td>
                            <td className={`${cellClass} tabular-nums`}>{row.contactedAdvanced}</td>
                            <td className={`${cellClass} text-muted-foreground`}>{row.note ?? ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {overview.notes.map(note => (
                <p key={note} className="mt-1 text-xs text-muted-foreground">
                    {note}
                </p>
            ))}
        </div>
    </div>
);
