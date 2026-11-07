'use client';

import type { AiOwnerReportManager } from '@/modules/entities/ai-analytics';
import {
    AI_OWNER_REPORT_MANAGER_COLUMNS,
    AI_OWNER_REPORT_TEXT,
} from '../../lib/ai-owner-report.texts';
import {
    AiOwnerReportSourceBadge,
    cellClass,
    headClass,
} from './AiOwnerReportSection';

interface AiOwnerReportManagersProps {
    managers: AiOwnerReportManager[];
}

const T = AI_OWNER_REPORT_TEXT;

/** Таблица показателей по сотрудникам и карточки с выводами. */
export const AiOwnerReportManagers = ({ managers }: AiOwnerReportManagersProps) => (
    <div className="space-y-4">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headClass}>{T.columns.employee}</th>
                        {AI_OWNER_REPORT_MANAGER_COLUMNS.map(([code, label]) => (
                            <th key={code} className={headClass}>
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {managers.map(manager => (
                        <tr key={manager.managerId} className="border-t border-border/40">
                            <td className={`${cellClass} whitespace-nowrap font-medium`}>
                                {manager.name}
                            </td>
                            {AI_OWNER_REPORT_MANAGER_COLUMNS.map(([code]) => (
                                <td key={code} className={`${cellClass} whitespace-nowrap tabular-nums`}>
                                    {manager.cells[code] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
            {managers.map(manager => (
                <article
                    key={manager.managerId}
                    className="space-y-2 rounded-md border border-border/60 p-3 text-sm"
                >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h5 className="font-semibold">{manager.name}</h5>
                        <span className="text-xs text-muted-foreground">{manager.headline}</span>
                    </div>
                    {manager.strengths.length > 0 && (
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">
                                {T.manager.strengths}
                            </div>
                            <ul className="list-disc space-y-0.5 pl-4 text-xs">
                                {manager.strengths.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {manager.risks.length > 0 && (
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">
                                {T.manager.risks}
                            </div>
                            <ul className="list-disc space-y-0.5 pl-4 text-xs">
                                {manager.risks.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground">
                            {T.manager.conclusion}
                        </div>
                        <p className="text-sm">{manager.conclusion}</p>
                    </div>
                    <AiOwnerReportSourceBadge source={manager.source} />
                </article>
            ))}
        </div>
    </div>
);
