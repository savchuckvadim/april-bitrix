import { FC } from 'react';
import { ABadge } from '@workspace/april-ui';

interface ActionProps {
    isDone: boolean;
    actionName: string;
    setIsDone: (value: boolean) => void;
    type: 'presentation' | 'learning' | 'firstLearning' | 'ss';
}

const Action: FC<ActionProps> = ({ type, actionName, isDone, setIsDone }) => {
    const currentColor =
        type == 'presentation'
            ? 'green'
            : type == 'ss'
              ? 'april'
              : type == 'firstLearning'
                ? 'fiolet'
                : 'orange';

    return (
        <div className="flex flex-col items-start justify-start">
            <label className="mb-1 text-sm text-muted-foreground">{actionName}</label>
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
