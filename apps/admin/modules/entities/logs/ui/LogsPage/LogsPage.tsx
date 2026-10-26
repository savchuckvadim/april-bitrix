'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { useLogRows, useLogsSummary } from '../../lib/hooks/use-logs';
import type { LogsFilter } from '../../model';
import { LogsFilters } from '../components/LogsFilters';
import { LogsRowsTable } from '../components/LogsRowsTable';
import { LogsSummaryTables } from '../components/LogsSummaryTables';

const ROWS_LIMIT = 100;

/**
 * Раздел «Журналы»: журналы всех приложений из ClickHouse. Выводы
 * словами, приложения против прошлого окна, повторяющиеся ошибки,
 * порталы и строки по фильтру. Нажатие на приложение или портал сужает
 * фильтр.
 */
export const LogsPage = () => {
    const [filter, setFilter] = useState<LogsFilter>({ hours: 24 });
    const summary = useLogsSummary(filter);
    const rows = useLogRows(filter, ROWS_LIMIT);
    const apps = summary.data?.apps.map(app => app.app) ?? [];

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Журналы приложений</h1>
                <p className="text-sm text-muted-foreground">
                    Все приложения April, данные ClickHouse (хранятся 30 дней). Время — местное.
                </p>
            </div>

            <LogsFilters
                filter={filter}
                apps={filter.app && !apps.includes(filter.app) ? [filter.app, ...apps] : apps}
                onChange={setFilter}
            />

            {summary.isError && (
                <HookNotice
                    tone="error"
                    title="Журналы не прочитались"
                    message={getApiErrorMessage(summary.error)}
                />
            )}

            {summary.data && (
                <SectionCard title="Выводы">
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        {summary.data.conclusions.map(line => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {summary.data && (
                <LogsSummaryTables
                    summary={summary.data}
                    onPickApp={app => setFilter({ ...filter, app })}
                    onPickDomain={domain => setFilter({ ...filter, domain })}
                />
            )}

            <LogsRowsTable rows={rows.data ?? []} loading={rows.isLoading} />
        </div>
    );
};
