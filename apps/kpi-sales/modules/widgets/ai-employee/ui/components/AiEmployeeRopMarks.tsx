'use client';

import { SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiDossierRopMarks } from '@/modules/entities/ai-analytics';
import {
    AI_RISK_CALL_LINK_LABEL,
    AI_RISK_CALL_LINK_TITLE,
    AiCardLink,
    AiRopMarkSaved,
    AiSectionState,
    aiCardLink,
} from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeRopMarks } from '../../hooks/use-ai-employee-rop-marks';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

interface AiEmployeeRopMarksProps {
    managerId: string;
    isLeader: boolean;
    enabled: boolean;
    /** Свод меток за окно досье; null — раздел досье пуст. */
    summary: AiDossierRopMarks | null;
}

const T = AI_EMPLOYEE_TEXT.feedback.ropMarks;

/**
 * Отметки руководителя: звонки сотрудника из подбора недели (сохранённая
 * метка с раскрытой оценкой AI либо «ещё не оценён», ссылка на разбор) —
 * только руководителю; всем — свод меток за окно досье.
 */
export const AiEmployeeRopMarks = ({ managerId, isLeader, enabled, summary }: AiEmployeeRopMarksProps) => {
    const marks = useAiEmployeeRopMarks(managerId, isLeader, enabled);

    return (
        <SectionCard surface="glass" title={T.title} description={T.description}>
            {isLeader ? (
                <>
                    <AiSectionState
                        status={marks.status}
                        error={marks.error}
                        loadingText="Подбираем звонки недели…"
                    />
                    {marks.week && marks.calls.length === 0 && (
                        <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
                    )}
                    {marks.calls.length > 0 && (
                        <ol className="space-y-2">
                            {marks.calls.map(call => {
                                const link = aiCardLink(call.link);
                                return (
                                    <li
                                        key={call.transcriptionId}
                                        className="space-y-2 rounded-md border border-border/60 p-3"
                                    >
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <ToneBadge tone="info" variant="soft" size="sm">
                                                {call.reasonTitle}
                                            </ToneBadge>
                                            {link && (
                                                <AiCardLink
                                                    href={link}
                                                    label={AI_RISK_CALL_LINK_LABEL}
                                                    title={AI_RISK_CALL_LINK_TITLE}
                                                />
                                            )}
                                        </div>
                                        {call.mark ? (
                                            <AiRopMarkSaved call={call} mark={call.mark} notes={[]} />
                                        ) : (
                                            <p className="text-xs text-muted-foreground">{T.notMarked}</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </>
            ) : (
                <p className="text-xs text-muted-foreground">{T.leaderOnly}</p>
            )}
            {summary && (
                <p className="mt-3 text-xs text-muted-foreground">
                    {T.summary(summary.total, summary.agree)}
                </p>
            )}
        </SectionCard>
    );
};
