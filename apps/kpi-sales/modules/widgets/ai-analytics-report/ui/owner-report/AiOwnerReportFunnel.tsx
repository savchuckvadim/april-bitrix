'use client';

import type { AiOwnerReportText } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportFunnelProps {
    funnel: AiOwnerReportText['funnel'];
    crm: AiOwnerReportText['crmFunnel'];
}

const T = AI_OWNER_REPORT_TEXT;
const C = T.columns;
const numCell = `${cellClass} text-right tabular-nums`;

/**
 * «Воронка и конверсии»: ступени по разговорам (холодный вход → показ →
 * после показа и КП) с исходами и согласием на счёт, цепочка конверсий,
 * вывод «где застревают деньги» и воронка по CRM из KPI-данных.
 */
export const AiOwnerReportFunnel = ({ funnel, crm }: AiOwnerReportFunnelProps) => (
    <div className="space-y-3">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{C.stage}</th>
                        <th className={`${headClass} text-right`}>{C.calls}</th>
                        <th className={`${headClass} text-right`}>{C.advanced}</th>
                        <th className={`${headClass} text-right`}>{C.undecided}</th>
                        <th className={`${headClass} text-right`}>{C.refused}</th>
                        <th className={`${headClass} text-right`}>{C.noContact}</th>
                        <th className={`${headClass} text-right`}>{C.invoiceAgreed}</th>
                    </tr>
                </thead>
                <tbody>
                    {funnel.rows.map(row => (
                        <tr key={row.code} className="border-t border-border/40">
                            <td className={cellClass}>{row.label}</td>
                            <td className={numCell}>{row.calls}</td>
                            <td className={numCell}>{row.advanced}</td>
                            <td className={numCell}>{row.undecided}</td>
                            <td className={numCell}>{row.refused}</td>
                            <td className={numCell}>{row.noContact}</td>
                            <td className={numCell}>{row.invoiceAgreed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {funnel.chain && <p className="text-xs">{funnel.chain}</p>}
        {funnel.afterOffer && (
            <div className="rounded-md border border-l-4 border-l-destructive bg-background/40 p-3">
                <div className="text-xs font-semibold">{T.funnel.afterOfferTitle}</div>
                <p className="mt-1 text-xs">{funnel.afterOffer}</p>
            </div>
        )}
        <p className="text-xs text-muted-foreground">{funnel.invoice}</p>
        {crm && (
            <div className="space-y-2">
                <h5 className="text-xs font-medium">{T.sections.crmFunnel}</h5>
                <table className="w-full max-w-xl border-collapse">
                    <thead>
                        <tr>
                            <th className={headClass}>{C.indicator}</th>
                            <th className={`${headClass} text-right`}>{C.value}</th>
                            <th className={`${headClass} text-right`}>{C.previous}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crm.rows.map(row => (
                            <tr key={row.label} className="border-t border-border/40">
                                <td className={cellClass}>{row.label}</td>
                                <td className={numCell}>{row.value}</td>
                                <td className={numCell}>{row.previous ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-xs">{crm.conversions}</p>
                <p className="text-xs text-muted-foreground">{crm.note}</p>
            </div>
        )}
    </div>
);
