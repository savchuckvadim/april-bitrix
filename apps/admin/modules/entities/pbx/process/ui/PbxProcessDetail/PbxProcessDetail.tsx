'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePortal } from '@/modules/entities/portal/hooks';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { PbxFieldsManager, type PbxFieldsAdapter } from '../../../fields';
import { PbxCategoriesManager, type PbxCategoriesAdapter } from '../../../categories';
import { PresenceBadge } from '../../../lib/ui';
import { usePbxProcess } from '../../lib/hooks';
import { describeProcessRecord } from '../../lib/utils/describe-process';
import type { PbxProcessAdapter } from '../../model';

interface PbxProcessDetailProps {
    portalId: number;
    /** Group axis value (sales/service/general) from the route. */
    group: string;
    /** Process code (smartName / rpaName) from the route. */
    variant: string;
    /** Human label for the header (falls back to `variant`). */
    label?: string;
    /** Href back to the process list (the smart/rpa index). */
    backHref: string;
    processAdapter: PbxProcessAdapter;
    fieldsAdapter: PbxFieldsAdapter;
    categoriesAdapter: PbxCategoriesAdapter;
}

/**
 * Drill-down view of a single smart/RPA process: a header summarising its
 * install state (read from the process monitoring payload) plus Поля /
 * Воронки-стадии sub-tabs scoped to this exact process (group + variant pinned,
 * no selects). Generic across Smart and RPA — only the adapters differ.
 */
export function PbxProcessDetail({
    portalId,
    group,
    variant,
    label,
    backHref,
    processAdapter,
    fieldsAdapter,
    categoriesAdapter,
}: PbxProcessDetailProps) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const { monitoring, install } = usePbxProcess(processAdapter, domain);

    const desc = React.useMemo(() => {
        const describe = processAdapter.describe ?? describeProcessRecord;
        return describe(monitoring.data, variant, group);
    }, [processAdapter, monitoring.data, variant, group]);

    const lockedScope = { group, variant };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={backHref}>← Назад к списку</Link>
                </Button>
                <h1 className="text-2xl font-bold">{label ?? variant}</h1>
                <Badge variant="outline" className="font-mono text-xs">
                    {group}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                    {variant}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">
                    Портал: {domain ?? '…'}
                </span>
                <span className="flex items-center gap-2">
                    Шаблон <PresenceBadge present={true} />
                </span>
                <span className="flex items-center gap-2">
                    Bitrix <PresenceBadge present={Boolean(desc.inBitrix)} />
                </span>
                <span className="flex items-center gap-2">
                    БД <PresenceBadge present={Boolean(desc.inDb)} />
                </span>
                {desc.entityTypeId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="font-mono text-xs">
                                entityTypeId: {desc.entityTypeId}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            Идентификатор типа сущности в Bitrix.
                        </TooltipContent>
                    </Tooltip>
                )}
                {!desc.inDb && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                disabled={!domain || install.isPending}
                                onClick={() =>
                                    install.mutate({ code: variant, group })
                                }
                            >
                                {install.isPending
                                    ? 'Установка…'
                                    : 'Установить смарт'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            Полная установка по эталону: тип + поля (+
                            воронки/стадии, если есть в шаблоне) с зеркалом в
                            PortalDB. Без установленного типа установка
                            отдельных полей невозможна.
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            <Tabs defaultValue="fields" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="fields">Поля</TabsTrigger>
                    <TabsTrigger value="categories">Воронки-стадии</TabsTrigger>
                </TabsList>
                <TabsContent value="fields">
                    <PbxFieldsManager
                        portalId={portalId}
                        adapter={fieldsAdapter}
                        lockedScope={lockedScope}
                    />
                </TabsContent>
                <TabsContent value="categories">
                    <PbxCategoriesManager
                        portalId={portalId}
                        adapter={categoriesAdapter}
                        lockedScope={lockedScope}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
