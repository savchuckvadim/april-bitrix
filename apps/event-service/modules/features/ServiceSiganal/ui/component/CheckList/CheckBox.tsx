import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FC } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { cn } from '@workspace/ui/lib/utils';
import { EV_SS_BXCHECKBOX } from '@/modules/features/ServiceSiganal/type/event-ss-type';
import { updateSSCheckbox } from '@/modules/features/ServiceSiganal/model/ServiceSignalThunk';

interface CheckBoxProps {
    checkbox: EV_SS_BXCHECKBOX;
    onCheck: () => void;
}

const CheckBox: FC<CheckBoxProps> = ({ checkbox }) => {
    const task = useAppSelector(state => state.eventTask.current);
    const dispatch = useAppDispatch();

    const check = (value: boolean) => {
        if (task) {
            dispatch(updateSSCheckbox(task.id, checkbox.ID, value));
        }
    };

    const isComplete = checkbox.IS_COMPLETE === 'Y';

    return (
        <div className="flex items-center gap-2 py-1">
            <Checkbox
                checked={isComplete}
                onCheckedChange={value => check(Boolean(value))}
            />
            <label
                className={cn(
                    'text-sm',
                    isComplete ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
            >
                {checkbox.TITLE}
            </label>
        </div>
    );
};

export default CheckBox;
