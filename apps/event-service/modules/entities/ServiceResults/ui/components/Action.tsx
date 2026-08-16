import { FC } from 'react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { ServiceResultsState } from '../../model/ServiceResultsSlice';
import { EV_SERVICE_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-service-type';
import { getServiceEventTone } from '../../lib/service-event-catalog';

interface ActionProps {
    isDone: boolean;
    actionName: string;
    setIsDone: (value: boolean) => void;
    type: keyof ServiceResultsState;
}

const Action: FC<ActionProps> = ({ type, actionName, isDone, setIsDone }) => {
    const tone = getServiceEventTone(type as EV_SERVICE_PLAN_CODE);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                className="max-w-full cursor-pointer border-0 bg-transparent p-0"
                onClick={() => setIsDone(isDone)}
            >
                <ToneBadge
                    tone={tone}
                    variant={isDone ? 'solid' : 'outline'}
                    size="sm"
                    uppercase
                    className="max-w-full [&>span]:truncate"
                >
                    <span className="truncate">{actionName}</span>
                </ToneBadge>
            </button>
            <div className="w-4 shrink-0">
                {isDone && (
                    <p className="m-0 text-xs font-semibold text-chart-2">+1</p>
                )}
            </div>
        </div>
    );
};

export default Action;
