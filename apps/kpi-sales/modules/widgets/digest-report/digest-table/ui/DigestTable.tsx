'use client';

import { SectionCard } from '@workspace/april-ui';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { useDigestTable } from '../hooks/use-digest-table';
import { DigestTableView } from './DigestTableView';

/** «По сотрудникам»: сводная таблица и разбивка по отделам/группам. */
export const DigestTable = () => {
    const table = useDigestTable();

    const renderRows = (userIds?: Set<number>) => {
        const subset = userIds
            ? table.rows.filter(row => userIds.has(row.userId))
            : table.rows;
        return (
            <DigestTableView
                rows={table.sortedRowsOf(subset)}
                totals={table.totalsOf(subset)}
                sort={table.sort}
                onSort={table.toggleSort}
                names={table.names}
                focusUserId={table.focusUserId}
                onFocus={table.toggleFocus}
            />
        );
    };

    return (
        <SectionCard
            surface="glass"
            title="По сотрудникам"
            description="Клик по имени — фокус на сотруднике: часы, лента и сравнение только по нему. Наведите на число — разбивка по типам."
        >
            <ReportGroupTabs
                presentUserIds={table.presentUserIds}
                renderSummary={() => renderRows()}
                renderSection={userIds => renderRows(userIds)}
            />
        </SectionCard>
    );
};
