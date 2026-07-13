import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { EV_TYPE, EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { soft } from '@workspace/april-ui';

export interface EventListRowProps {
    i: number;
    task: EventTask;
    setResultMenuStatus: (status: EventItemResultType, task: EventTask) => void;
    isSmallDisplay: boolean;
    getEvClass: (type: EV_TYPE) => string;
}

const STATUS_BADGE = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

export const EventListRow = ({
    task,
    setResultMenuStatus,
    isSmallDisplay,
    getEvClass,
    i,
}: EventListRowProps) => {
    return (
        <TableRow>
            <TableCell className="font-medium">{i + 1}.</TableCell>
            <TableCell>
                <span className="text-foreground">{task.name}</span>
            </TableCell>
            <TableCell>
                <span className={getEvClass(task.type)}>{task.type.toUpperCase()}</span>
            </TableCell>
            <TableCell>{task.deadline}</TableCell>
            {!isSmallDisplay && (
                <TableCell>
                    {task.isExpired === 'no' ? (
                        <span className={`${STATUS_BADGE} ${soft('success')}`}>запланирован</span>
                    ) : task.isExpired === 'yes' ? (
                        <span className={`${STATUS_BADGE} ${soft('danger')}`}>просрочен</span>
                    ) : (
                        <span className={`${STATUS_BADGE} ${soft('warning')}`}>скоро</span>
                    )}
                </TableCell>
            )}
            <TableCell>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => setResultMenuStatus(EventItemResultType.RESULT, task)}
                    >
                        Результативный
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResultMenuStatus(EventItemResultType.NORESULT, task)}
                    >
                        Не очень
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};
