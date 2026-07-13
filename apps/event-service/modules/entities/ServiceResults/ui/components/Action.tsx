import { FC } from 'react';
import { ABadge } from '@workspace/april-ui';
import { ServiceResultsState } from '../../model/ServiceResultsSlice';
import { EV_SERVICE_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-service-type';

interface ActionProps {
    isDone: boolean;
    actionName: string;
    setIsDone: (value: boolean) => void;
    type: keyof ServiceResultsState;
}

const Action: FC<ActionProps> = ({ type, actionName, isDone, setIsDone }) => {
    const currentColor =
        type == EV_SERVICE_PLAN_CODE.PRESENTATION
            ? 'green'
            : type == EV_SERVICE_PLAN_CODE.SS
              ? 'april'
              : type == EV_SERVICE_PLAN_CODE.LEARNING_FIRST
                ? 'fiolet'
                : 'orange';

    return (
        <div className="flex flex-col items-start justify-start">
            <div className="flex items-center gap-1">
                <ABadge
                    title={actionName.toUpperCase()}
                    color={currentColor}
                    clickHendler={setIsDone}
                    clickHendlerData={{ isDone }}
                    size="small"
                    isActive={isDone}
                    isIconeDone={true}
                />
                <div className="w-5">
                    {isDone && <p className="m-0 text-xs font-semibold text-chart-2">+1</p>}
                </div>
            </div>
        </div>
    );
};

export default Action;
