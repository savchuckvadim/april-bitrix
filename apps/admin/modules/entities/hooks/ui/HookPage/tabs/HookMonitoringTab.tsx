'use client';

import { RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    HOOK_OPERATION_STATUS_BADGE,
    HOOKS_TEXT,
} from '../../../consts/hooks.const';
import { usePortalHookOperations } from '../../../lib/hooks';
import { formatHookDateTime } from '../../../lib/hooks-format';
import type {
    HookCatalogEntry,
    HookOperation,
    HookOperationsByHook,
    HookOperationsSummary,
} from '../../../model';
import { HookBadge } from '../../components/HookBadges';
import { HookNotice } from '../../components/HookNotice';

interface HookMonitoringTabProps {
    entry: HookCatalogEntry;
    portalId: number | undefined;
}

const OPERATION_COLUMNS: Column<HookOperation>[] = [
    {
        id: 'status',
        header: HOOKS_TEXT.opStatus,
        cell: row => (
            <HookBadge badge={HOOK_OPERATION_STATUS_BADGE[row.status]} size="sm" />
        ),
        className: 'w-28',
    },
    {
        id: 'source',
        header: HOOKS_TEXT.opSource,
        cell: row => row.source || '—',
        className: 'w-20',
    },
    {
        id: 'items',
        header: HOOKS_TEXT.opItems,
        cell: row => row.itemsCount,
        className: 'w-20',
    },
    {
        id: 'queuedAt',
        header: HOOKS_TEXT.opQueuedAt,
        cell: row => formatHookDateTime(row.queuedAt),
        className: 'w-40',
    },
    {
        id: 'finishedAt',
        header: HOOKS_TEXT.opFinishedAt,
        cell: row => formatHookDateTime(row.finishedAt),
        className: 'w-40',
    },
    {
        id: 'warnings',
        header: HOOKS_TEXT.opWarnings,
        cell: row => row.warningsCount ?? '—',
        className: 'w-20',
    },
    {
        id: 'result',
        header: HOOKS_TEXT.opResult,
        cell: row => (
            <div className="space-y-0.5 whitespace-normal text-xs">
                {row.error && <div className="text-destructive">{row.error}</div>}
                {row.resultSummary && (
                    <div className="text-muted-foreground">{row.resultSummary}</div>
                )}
                <code className="font-mono text-[10px] text-muted-foreground">
                    {row.operationId}
                </code>
            </div>
        ),
    },
];

const BY_HOOK_COLUMNS: Column<HookOperationsByHook>[] = [
    {
        id: 'hook',
        header: HOOKS_TEXT.byHookHook,
        cell: row => <code className="font-mono text-xs">{row.hook}</code>,
    },
    { id: 'total', header: HOOKS_TEXT.byHookTotal, accessorKey: 'total' },
    { id: 'failed', header: HOOKS_TEXT.byHookFailed, accessorKey: 'failed' },
    { id: 'running', header: HOOKS_TEXT.byHookRunning, accessorKey: 'running' },
    {
        id: 'lastAt',
        header: HOOKS_TEXT.byHookLastAt,
        cell: row => formatHookDateTime(row.lastAt),
    },
];

const SummaryTiles = ({ summary }: { summary: HookOperationsSummary }) => {
    const tiles: Array<{ label: string; value: number; tone?: string }> = [
        { label: HOOKS_TEXT.summaryTotal, value: summary.total },
        { label: HOOKS_TEXT.summaryQueued, value: summary.queued },
        { label: HOOKS_TEXT.summaryRunning, value: summary.running },
        { label: HOOKS_TEXT.summaryDone, value: summary.done, tone: 'text-success' },
        {
            label: HOOKS_TEXT.summaryFailed,
            value: summary.failed,
            tone: summary.failed > 0 ? 'text-destructive' : undefined,
        },
    ];
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {tiles.map(tile => (
                <div key={tile.label} className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{tile.label}</div>
                    <div className={`text-2xl font-semibold ${tile.tone ?? ''}`}>
                        {tile.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Операции хука на портале из кэша статусов (окно час-два): сводка,
 * разбивка по хукам и таблица последних операций с ошибками и выжимкой
 * результата. Пока вкладка открыта — автообновление.
 */
export const HookMonitoringTab = ({ entry, portalId }: HookMonitoringTabProps) => {
    const hook = entry.operationHook ?? undefined;
    const operations = usePortalHookOperations(portalId, hook);

    if (!portalId) {
        return <HookNotice tone="info" message={HOOKS_TEXT.monitoringNeedsPortal} />;
    }

    const data = operations.data;
    const viaOtherHook = Boolean(hook && hook !== entry.code);

    return (
        <div className="space-y-4">
            <SectionCard
                title={HOOKS_TEXT.monitoringTitle}
                description={data?.windowNote}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={operations.isFetching}
                        onClick={() => void operations.refetch()}
                    >
                        <RefreshCw
                            className={`size-4 ${operations.isFetching ? 'animate-spin' : ''}`}
                        />
                        {operations.isFetching ? HOOKS_TEXT.refreshing : HOOKS_TEXT.refresh}
                    </Button>
                }
            >
                <div className="space-y-4">
                    {viaOtherHook && (
                        <p className="text-sm text-muted-foreground">
                            {HOOKS_TEXT.operationsOfHook}{' '}
                            <code className="font-mono">{hook}</code>
                            {HOOKS_TEXT.operationsOfHookTail}
                        </p>
                    )}
                    {operations.isLoading && (
                        <p className="text-sm text-muted-foreground">{HOOKS_TEXT.loading}</p>
                    )}
                    {operations.isError && (
                        <HookNotice
                            tone="error"
                            title={HOOKS_TEXT.monitoringLoadError}
                            message={getApiErrorMessage(operations.error)}
                        />
                    )}
                    {data && (
                        <>
                            <SummaryTiles summary={data.summary} />
                            <p className="text-xs text-muted-foreground">
                                {HOOKS_TEXT.lastActivity}:{' '}
                                {formatHookDateTime(data.summary.lastActivityAt)}
                            </p>
                        </>
                    )}
                </div>
            </SectionCard>

            {data && data.summary.byHook.length > 1 && (
                <SectionCard title={HOOKS_TEXT.byHookTitle}>
                    <DataTable data={data.summary.byHook} columns={BY_HOOK_COLUMNS} />
                </SectionCard>
            )}

            {data && (
                <SectionCard title={HOOKS_TEXT.operationsTitle}>
                    <DataTable
                        data={data.operations}
                        columns={OPERATION_COLUMNS}
                        emptyMessage={HOOKS_TEXT.monitoringEmpty}
                    />
                </SectionCard>
            )}
        </div>
    );
};
