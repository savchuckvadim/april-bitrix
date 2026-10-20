'use client';

import { SectionCard } from '@workspace/april-ui';
import { AiQueuedState } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';
import { AiEmployeeTile } from '../components/AiEmployeeTile';

const T = AI_EMPLOYEE_TEXT.brief;

/**
 * Подвкладка «Коротко»: резюме-строка из фактов и плитки — оценка и
 * разобрано, уровень и цель месяца, движение к цели, стиль одной фразой,
 * что меняется, год назад. Пока обзор считается — состояние задания; его
 * отсутствие плитки переживают запасными текстами.
 */
export const AiEmployeeBriefTab = () => {
    const { brief, overview, row } = useAiEmployeeContext();

    return (
        <SectionCard surface="glass" title={T.title} description={T.description}>
            {!row && overview.status !== 'ready' && (
                <AiQueuedState
                    status={overview.status}
                    jobStatus={overview.jobStatus}
                    error={overview.error}
                    loadingText={AI_EMPLOYEE_TEXT.overviewLoading}
                    skeletonRows={2}
                    onRetry={overview.retry}
                />
            )}
            <p className="text-base font-medium">{brief.slogan}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {brief.tiles.map(tile => (
                    <AiEmployeeTile key={tile.key} tile={tile} />
                ))}
            </div>
        </SectionCard>
    );
};
