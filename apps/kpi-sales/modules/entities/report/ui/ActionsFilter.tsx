import React from 'react';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { Filter, FilterInnerCode } from '../model/types/report/report-type';

interface ActionsFilterProps {
    /** Все действия, из которых можно выбирать. */
    items: ReadonlyArray<Filter>;
    /** Коды выбранных действий. */
    currentCodes: ReadonlyArray<FilterInnerCode>;
    /** Действие нажато: включить, если было выключено, и наоборот. */
    onToggle: (code: FilterInnerCode) => void;
}

/**
 * Действия отчёта (плашки-переключатели). Компонент управляемый — выбор
 * приходит снаружи, в состояние отчёта он не пишет.
 */
const ActionsFilter: React.FC<ActionsFilterProps> = ({
    items,
    currentCodes,
    onToggle,
}) => (
    <div className="mt-4">
        <Label>Действия</Label>
        <div className="flex flex-wrap gap-2 mt-2">
            {items.map(action => {
                const isCurrent = currentCodes.includes(action.innerCode);
                return (
                    <Badge
                        key={action.innerCode}
                        variant={isCurrent ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => onToggle(action.innerCode)}
                    >
                        {action.name}
                    </Badge>
                );
            })}
        </div>
    </div>
);

export default ActionsFilter;
