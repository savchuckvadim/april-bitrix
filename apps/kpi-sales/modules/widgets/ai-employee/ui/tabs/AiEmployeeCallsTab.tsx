'use client';

import { useMemo } from 'react';
import { SectionCard } from '@workspace/april-ui';
import { formatAiDossierObjection } from '@/modules/entities/ai-analytics';
import { AiQueuedState } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';
import {
    aiEmployeeLowScoreMax,
    buildAiEmployeeLinkMap,
    buildAiEmployeeLowCalls,
    buildAiEmployeeRiskCalls,
    isAiEmployeeQualityMissing,
} from '../../lib/ai-employee-calls.util';
import {
    AiEmployeeLowCallRow,
    AiEmployeeRiskCallRow,
} from '../components/AiEmployeeCallRows';

const T = AI_EMPLOYEE_TEXT.calls;
const MUTED = 'py-2 text-xs text-muted-foreground';

/**
 * Подвкладка «Звонки»: риск-звонки с цитатами (сигналы пульса и
 * риск-звонки обзора) и ссылками на разбор, звонки с низкой оценкой
 * (порог — из ответа), возражения клиентов за окно досье с долей
 * отработанных. Пока обзор считается — состояние задания.
 */
export const AiEmployeeCallsTab = () => {
    const { managerId, row, overview, attention, pulse, dossier } = useAiEmployeeContext();
    const links = useMemo(
        () => buildAiEmployeeLinkMap({ row, attention, pulse, managerId }),
        [row, attention, pulse, managerId],
    );
    const riskCalls = useMemo(
        () => buildAiEmployeeRiskCalls({ row, pulse, managerId, links }),
        [row, pulse, managerId, links],
    );
    const lowCalls = useMemo(() => buildAiEmployeeLowCalls(row, links), [row, links]);
    const lowMax = aiEmployeeLowScoreMax(row);
    const objections = dossier.data?.objections ?? null;

    return (
        <>
            {overview.status !== 'ready' && (
                <AiQueuedState
                    status={overview.status}
                    jobStatus={overview.jobStatus}
                    error={overview.error}
                    loadingText={AI_EMPLOYEE_TEXT.overviewLoading}
                    skeletonRows={2}
                    onRetry={overview.retry}
                />
            )}
            <SectionCard surface="glass" title={T.risk.title} description={T.risk.description}>
                {riskCalls.length ? (
                    <ul className="space-y-2">
                        {riskCalls.map(call => (
                            <AiEmployeeRiskCallRow key={call.transcriptionId} call={call} />
                        ))}
                    </ul>
                ) : (
                    <p className={MUTED}>{T.risk.empty}</p>
                )}
            </SectionCard>

            <SectionCard surface="glass" title={T.low.title} description={T.low.description(lowMax)}>
                {lowCalls.length ? (
                    <ul className="space-y-1">
                        {lowCalls.map(call => (
                            <AiEmployeeLowCallRow key={call.transcriptionId} call={call} />
                        ))}
                    </ul>
                ) : (
                    <p className={MUTED}>
                        {isAiEmployeeQualityMissing(row) ? T.low.oldCache : T.low.empty}
                    </p>
                )}
            </SectionCard>

            <SectionCard surface="glass" title={T.objections.title} description={T.objections.description}>
                {objections && objections.length > 0 ? (
                    <ul className="space-y-0.5 text-sm">
                        {objections.map(category => (
                            <li key={category.category}>{formatAiDossierObjection(category)}</li>
                        ))}
                    </ul>
                ) : (
                    <p className={MUTED}>{T.objections.empty}</p>
                )}
            </SectionCard>
        </>
    );
};
