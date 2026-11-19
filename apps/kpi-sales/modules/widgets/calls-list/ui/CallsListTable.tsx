import { Table, TableBody } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import type { CallsListItem } from '@/modules/entities/calls-list';
import { CallsListHead } from './components/CallsListHead';
import { CallsListRow } from './components/CallsListRow';

interface CallsListTableProps {
    items: CallsListItem[];
    /** Грузится следующая страница — строки приглушены, пока не придёт ответ. */
    loading: boolean;
}

/** Таблица разборов на всю ширину (по образцу таблиц AI-аналитики). */
export const CallsListTable = ({ items, loading }: CallsListTableProps) => (
    <div aria-busy={loading} className={cn('transition-opacity', loading && 'opacity-60')}>
        <Table>
            <CallsListHead />
            <TableBody>
                {items.map(item => (
                    <CallsListRow key={item.transcriptionId} item={item} />
                ))}
            </TableBody>
        </Table>
    </div>
);
