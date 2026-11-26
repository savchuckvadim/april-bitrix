import type { RTableAction, RTableRow } from '@workspace/april-ui';

/**
 * Дополнение строк таблицы показателей колонками (например, колонками
 * планов). Сущности получают его параметром и о фичах не знают; входные
 * строки не изменяются.
 */
export type TableRowsDecorator = (rows: readonly RTableRow[]) => RTableRow[];

/**
 * Дополнение колонок итоговой таблицы (например, итогом плана) по
 * сотрудникам её строк.
 */
export type TableTotalsDecorator = (
    columns: readonly RTableAction[],
    userIds: readonly number[],
) => RTableAction[];
