import { SectionCard } from '@workspace/april-ui/surfaces';
import type { CallPageDto } from '@/modules/entities/call-page';

const HEADING = 'text-xs font-medium uppercase tracking-wide text-muted-foreground';

/** Суть разговора, из чего сложилась оценка и что сделать. */
export const CallSummaryCard = ({ data }: { data: CallPageDto }) => {
    const { score } = data;
    const numbers = [
        score.weightedScore === null
            ? null
            : `Взвешенная оценка — ${score.weightedScore} из 100`,
        score.scriptCompliance === null
            ? null
            : `Соответствие скрипту — ${score.scriptCompliance} %`,
    ].filter((item): item is string => item !== null);

    return (
        <SectionCard title="Суть и оценка">
            <div className="space-y-4 text-sm">
                {score.incompleteNote && (
                    <p className="rounded-md bg-warning/15 px-3 py-2">
                        {score.incompleteNote}
                    </p>
                )}
                {data.summary && <p>{data.summary}</p>}
                {(score.explanation || numbers.length > 0) && (
                    <div className="space-y-1">
                        <h3 className={HEADING}>Почему такая оценка</h3>
                        {score.explanation && <p>{score.explanation}</p>}
                        {numbers.length > 0 && (
                            <p className="text-muted-foreground">
                                {numbers.join(' · ')}
                            </p>
                        )}
                    </div>
                )}
                {data.recommendations.length > 0 && (
                    <div className="space-y-1">
                        <h3 className={HEADING}>Что сделать по этому звонку</h3>
                        <ul className="list-disc space-y-1 pl-5">
                            {data.recommendations.map(item => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {data.employeeRecommendations && (
                    <div className="space-y-1">
                        <h3 className={HEADING}>Что потренировать менеджеру</h3>
                        <p>{data.employeeRecommendations}</p>
                    </div>
                )}
            </div>
        </SectionCard>
    );
};
