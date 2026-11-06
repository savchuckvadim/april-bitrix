'use client';

import type { AiOwnerReportText } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { AiCardLink } from '../components/AiCardLink';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportObjectionsProps {
    objections: AiOwnerReportText['objections'];
    issues: AiOwnerReportText['issues'];
}

const T = AI_OWNER_REPORT_TEXT;
const C = T.columns;

/** Возражения по темам и сбои не по вине разговора. */
export const AiOwnerReportObjections = ({ objections, issues }: AiOwnerReportObjectionsProps) => (
    <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
            <p className="text-sm">{objections.intro}</p>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{C.topic}</th>
                        <th className={`${headClass} text-right`}>{C.calls}</th>
                        <th className={`${headClass} text-right`}>{C.handled}</th>
                        <th className={`${headClass} text-right`}>{C.advancedAfter}</th>
                    </tr>
                </thead>
                <tbody>
                    {objections.rows.map(row => (
                        <tr key={row.label} className="border-t border-border/40">
                            <td className={cellClass}>{row.label}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.calls}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.handled}</td>
                            <td className={`${cellClass} text-right tabular-nums`}>{row.advancedAfter}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {objections.coldTop && (
                <p className="text-xs text-muted-foreground">{objections.coldTop}</p>
            )}
        </div>
        <div className="space-y-2">
            <h5 className="text-xs font-medium">{T.sections.issues}</h5>
            <p className="text-sm">{issues.intro}</p>
            {issues.rows.length > 0 && (
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className={headClass}>{C.issue}</th>
                            <th className={`${headClass} text-right`}>{C.calls}</th>
                            <th className={headClass}>{C.examples}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.rows.map(row => (
                            <tr key={row.label} className="border-t border-border/40">
                                <td className={cellClass}>{row.label}</td>
                                <td className={`${cellClass} text-right tabular-nums`}>{row.calls}</td>
                                <td className={cellClass}>
                                    <span className="flex flex-wrap gap-2">
                                        {row.exampleLinks.map((link, index) => (
                                            <AiCardLink
                                                key={link}
                                                href={link}
                                                label={T.leak.example(index + 1)}
                                                title={T.leak.linkTitle}
                                            />
                                        ))}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);
