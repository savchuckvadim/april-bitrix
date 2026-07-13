import { FC, useEffect, useState } from 'react';
import { EV_TYPE, EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import useWindowSize from '@/modules/app/lib/hooks/display';
import { soft, type LegacyColor } from '@workspace/april-ui';
import EventListHeader from './components/EventListHeader';
import { EventListRow } from './components/EventListRow';
import { useEventList } from '../lib/hooks/use-event-list';

// EV_TYPE -> design-system intent (legacy color name resolved by @workspace/april-ui).
const EV_TYPE_COLOR: Record<EV_TYPE, LegacyColor> = {
    [EV_TYPE.XO]: 'blue',
    [EV_TYPE.WARM]: 'orange',
    [EV_TYPE.PRES]: 'fiolet',
    [EV_TYPE.HOT]: 'danger',
    [EV_TYPE.MONEY]: 'success',
    [EV_TYPE.SS]: 'blue',
    [EV_TYPE.INFO]: 'orange',
    [EV_TYPE.INFO_GARANT]: 'blue',
    [EV_TYPE.COMMER]: 'blue',
    [EV_TYPE.LEARNING_FIRST]: 'fiolet',
    [EV_TYPE.LEARNING]: 'fiolet',
    [EV_TYPE.DOCUMENTS]: 'dark',
    [EV_TYPE.PERE_LONG]: 'grey',
    [EV_TYPE.DEBIT]: 'danger',
    [EV_TYPE.FAIL]: 'danger',
};

const EventList: FC = () => {
    const { tasks, setResultMenuStatus } = useEventList();
    const getEvClass = (type: EV_TYPE): string =>
        `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${soft(EV_TYPE_COLOR[type] ?? 'blue')}`;

    const { width } = useWindowSize();
    const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577);
    useEffect(() => {
        setIsSmallDisplay(width < 577);
    }, [width]);

    return (
        <div className="p-2 pt-0">
            <EventListHeader />
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Что надо сделать</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Крайний срок</TableHead>
                            {!isSmallDisplay && <TableHead>Текущий статус</TableHead>}
                            <TableHead>Действие</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks &&
                            tasks.length > 0 &&
                            tasks.map((task, i) => (
                                <EventListRow
                                    key={`table-row-${task.id}`}
                                    task={task}
                                    setResultMenuStatus={setResultMenuStatus}
                                    isSmallDisplay={isSmallDisplay}
                                    getEvClass={getEvClass}
                                    i={i}
                                />
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default EventList;
