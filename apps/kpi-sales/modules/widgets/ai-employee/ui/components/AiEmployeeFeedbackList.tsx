'use client';

import { SectionCard, ToneBadge } from '@workspace/april-ui';
import { formatAiMoment } from '@/modules/entities/ai-analytics';
import { AiSectionState } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeFeedbackList } from '../../hooks/use-ai-employee-feedback-list';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

interface AiEmployeeFeedbackListProps {
    managerId: string;
    period: { from: string; to: string } | null;
    enabled: boolean;
}

const T = AI_EMPLOYEE_TEXT.feedback.list;

/**
 * Реакции на витрину по сотруднику за период: счётчики по видам, доля
 * несогласий, последние записи словами (вид, объект, когда, причина).
 */
export const AiEmployeeFeedbackList = ({ managerId, period, enabled }: AiEmployeeFeedbackListProps) => {
    const feedback = useAiEmployeeFeedbackList(managerId, period, enabled);

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description(feedback.period.from, feedback.period.to)}
        >
            <AiSectionState
                status={feedback.status}
                error={feedback.error}
                loadingText={T.loading}
                onRetry={feedback.retry}
            />
            {feedback.data && feedback.items.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
            )}
            {feedback.data && feedback.items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {feedback.groups.map(group => (
                            <ToneBadge key={group.kind} tone="neutral" variant="soft" size="sm">
                                {group.label} {group.count}
                            </ToneBadge>
                        ))}
                        {feedback.data.disagreementSharePct !== null && (
                            <span className="text-muted-foreground">
                                {T.disagreementShare(feedback.data.disagreementSharePct)}
                            </span>
                        )}
                    </div>
                    <ul className="space-y-1 text-xs">
                        {feedback.items.map(item => (
                            <li key={item.id} className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{item.kindLabel}</span>
                                <span className="text-muted-foreground">{item.objectLabel}</span>
                                <span className="text-muted-foreground">
                                    {formatAiMoment(item.createdAt)}
                                </span>
                                {item.reason && <span>«{item.reason}»</span>}
                            </li>
                        ))}
                        {feedback.hidden > 0 && (
                            <li className="text-muted-foreground">{T.more(feedback.hidden)}</li>
                        )}
                    </ul>
                </div>
            )}
        </SectionCard>
    );
};
