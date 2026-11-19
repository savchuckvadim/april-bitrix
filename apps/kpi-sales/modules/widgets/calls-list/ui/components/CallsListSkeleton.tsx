import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { MicroSkeleton } from '@workspace/april-ui/feedback';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';
import { CallsListHead } from './CallsListHead';

const ROWS = 8;
/** Ширины «ячеек» скелета — как у настоящих колонок. */
const CELL_WIDTHS = ['w-28', 'w-36', 'w-44', 'w-20', 'w-16', 'w-10', 'w-24', 'w-16'] as const;

/** Скелет таблицы, пока грузится первая страница. */
export const CallsListSkeleton = () => (
    <div aria-busy aria-label={CALLS_LIST_TEXT.states.loading}>
        <Table>
            <CallsListHead />
            <TableBody>
                {Array.from({ length: ROWS }, (_, row) => (
                    <TableRow key={row}>
                        {CELL_WIDTHS.map((width, cell) => (
                            <TableCell key={cell}>
                                <MicroSkeleton className={`h-4 ${width}`} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
