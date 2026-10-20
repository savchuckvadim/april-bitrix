'use client';

import { SectionCard } from '@workspace/april-ui';
import { AiSignalLeversCell } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';
import { AiEmployeeFeedbackList } from '../components/AiEmployeeFeedbackList';
import { AiEmployeeRopMarks } from '../components/AiEmployeeRopMarks';

const T = AI_EMPLOYEE_TEXT.feedback;

/**
 * Подвкладка «Обратная связь»: реакции на витрину по сотруднику, отметки
 * руководителя по звонкам недели (руководителю) со сводом за окно досье,
 * советы сотруднику с отметками «Сделано» / «Не согласен».
 */
export const AiEmployeeFeedbackTab = () => {
    const { managerId, period, isLeader, kpiOnly, row, dossier } = useAiEmployeeContext();
    const recommendations = row?.recommendations ?? [];

    return (
        <>
            <AiEmployeeFeedbackList managerId={managerId} period={period} enabled={!kpiOnly} />
            <AiEmployeeRopMarks
                managerId={managerId}
                isLeader={isLeader}
                enabled={!kpiOnly}
                summary={dossier.data?.ropMarks ?? null}
            />
            <SectionCard surface="glass" title={T.advice.title} description={T.advice.description}>
                {recommendations.length ? (
                    <AiSignalLeversCell managerId={managerId} recommendations={recommendations} />
                ) : (
                    <p className="py-2 text-xs text-muted-foreground">{T.advice.empty}</p>
                )}
            </SectionCard>
        </>
    );
};
