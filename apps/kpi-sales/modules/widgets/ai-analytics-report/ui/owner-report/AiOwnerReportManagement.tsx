'use client';

import { ToneBadge } from '@workspace/april-ui';
import type { AiOwnerReportText } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { cellClass, headClass } from './AiOwnerReportSection';

interface AiOwnerReportManagementProps {
    management: AiOwnerReportText['management'];
}

const C = AI_OWNER_REPORT_TEXT.columns;

/** Тон вердикта по его слову (слова — с сервера, по-русски). */
const verdictTone = (
    verdict: string,
): 'success' | 'warning' | 'destructive' | 'muted' =>
    verdict === 'Есть'
        ? 'success'
        : verdict === 'Нет'
          ? 'destructive'
          : verdict === 'Не проверялось'
            ? 'muted'
            : 'warning';

/** Признаки управления с вердиктами и общий вердикт. */
export const AiOwnerReportManagement = ({
    management,
}: AiOwnerReportManagementProps) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">{management.verdict}</span>
            <span className="text-xs text-muted-foreground">
                {management.verdictText}
            </span>
        </div>
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <th className={headClass}>{C.sign}</th>
                    <th className={headClass}>{C.verdict}</th>
                    <th className={headClass}>{C.detail}</th>
                </tr>
            </thead>
            <tbody>
                {management.rows.map(row => (
                    <tr key={row.code} className="border-t border-border/40">
                        <td className={cellClass}>{row.title}</td>
                        <td className={cellClass}>
                            <ToneBadge
                                tone={verdictTone(row.verdict)}
                                variant="soft"
                                size="sm"
                            >
                                {row.verdict}
                            </ToneBadge>
                        </td>
                        <td className={`${cellClass} text-muted-foreground`}>
                            {row.detail}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
