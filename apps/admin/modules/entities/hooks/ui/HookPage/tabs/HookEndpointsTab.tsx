'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    HOOK_ENDPOINT_KIND_LABEL,
    HOOK_PARAM_WHERE_LABEL,
    HOOKS_TEXT,
} from '../../../consts/hooks.const';
import type { HookCatalogEntry, HookParam } from '../../../model';
import { HookCodeBlock } from '../../components/HookCodeBlock';
import { HookWebhookBuilder } from './HookWebhookBuilder';

interface HookEndpointsTabProps {
    entry: HookCatalogEntry;
}

const PARAM_COLUMNS: Column<HookParam>[] = [
    {
        id: 'name',
        header: HOOKS_TEXT.paramName,
        cell: row => (
            <code className="font-mono text-xs">
                {row.name}
                {row.required && <span className="text-destructive"> *</span>}
            </code>
        ),
        className: 'w-40',
    },
    {
        id: 'where',
        header: HOOKS_TEXT.paramWhere,
        cell: row => HOOK_PARAM_WHERE_LABEL[row.where],
        className: 'w-28',
    },
    {
        id: 'values',
        header: HOOKS_TEXT.paramValues,
        cell: row => row.values ?? '—',
        className: 'w-48',
    },
    {
        id: 'default',
        header: HOOKS_TEXT.paramDefault,
        cell: row => row.default ?? '—',
        className: 'w-28',
    },
    {
        id: 'runOnly',
        header: HOOKS_TEXT.paramRunOnly,
        cell: row => (row.runOnly ? HOOKS_TEXT.yes : HOOKS_TEXT.no),
        className: 'w-24',
    },
    {
        id: 'description',
        header: HOOKS_TEXT.paramDescription,
        cell: row => (
            <span className="whitespace-normal text-sm">{row.description}</span>
        ),
    },
];

/**
 * Ручки хука (метод, путь, кто зовёт, пример), конструктор адреса для
 * робота и таблица параметров.
 */
export const HookEndpointsTab = ({ entry }: HookEndpointsTabProps) => (
    <div className="space-y-4">
        <SectionCard title={HOOKS_TEXT.endpointsTitle}>
            {entry.endpoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {HOOKS_TEXT.endpointsEmpty}
                </p>
            ) : (
                <div className="space-y-4">
                    {entry.endpoints.map(endpoint => (
                        <div
                            key={`${endpoint.kind}:${endpoint.path}`}
                            className="space-y-2 rounded-md border p-3"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <ToneBadge
                                    tone={endpoint.method === 'GET' ? 'info' : 'primary'}
                                    variant="soft"
                                >
                                    {endpoint.method}
                                </ToneBadge>
                                <code className="break-all font-mono text-sm">
                                    {endpoint.path}
                                </code>
                                <ToneBadge tone="neutral" variant="outline" size="sm">
                                    {HOOK_ENDPOINT_KIND_LABEL[endpoint.kind]}
                                </ToneBadge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {endpoint.description}
                            </p>
                            {endpoint.example && (
                                <HookCodeBlock
                                    value={endpoint.example}
                                    label={HOOKS_TEXT.endpointExample}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>

        <HookWebhookBuilder endpoints={entry.endpoints} params={entry.params} />

        <SectionCard title={HOOKS_TEXT.paramsTitle}>
            {entry.params.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {HOOKS_TEXT.paramsEmpty}
                </p>
            ) : (
                <DataTable data={entry.params} columns={PARAM_COLUMNS} />
            )}
        </SectionCard>
    </div>
);
