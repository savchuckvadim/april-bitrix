import React from 'react';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { useAppSelector, useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { FilterInnerCode } from '../model/types/report/report-type';
import { setCurrentActions } from '../model/report-thunks';

const ActionsFilter: React.FC = () => {
    
    const actions = useAppSelector(state => state.report.actions)
    const dispatch = useAppDispatch()
    const handleActionChange = (actionCode: FilterInnerCode) => dispatch(
        setCurrentActions(actionCode)
    )

    return (
        <div className="mt-4">
            <Label>Действия</Label>
            <div className="flex flex-wrap gap-2 mt-2">
                {actions.items.map((action) => {
                    const isCurrent = actions.current.includes(action);
                    return (
                        <Badge
                            key={action.innerCode}
                            variant={isCurrent ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleActionChange(action.innerCode)}
                        >
                            {action.name}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionsFilter; 