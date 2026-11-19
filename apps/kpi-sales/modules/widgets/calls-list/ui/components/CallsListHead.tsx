import { TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';

const T = CALLS_LIST_TEXT.table;

/** Шапка таблицы разборов — одна на таблицу и её скелет. */
export const CallsListHead = () => (
    <TableHeader>
        <TableRow>
            <TableHead>{T.startedAt}</TableHead>
            <TableHead>{T.manager}</TableHead>
            <TableHead>{T.client}</TableHead>
            <TableHead>{T.type}</TableHead>
            <TableHead>{T.duration}</TableHead>
            <TableHead>{T.aiScore}</TableHead>
            <TableHead>{T.reviews}</TableHead>
            <TableHead className="text-right">
                <span className="sr-only">{T.open}</span>
            </TableHead>
        </TableRow>
    </TableHeader>
);
