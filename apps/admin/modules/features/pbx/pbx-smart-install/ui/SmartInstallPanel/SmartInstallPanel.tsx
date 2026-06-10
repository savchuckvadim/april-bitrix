'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { NodeStatusBadge } from '../NodeStatusBadge';
import { usePbxSmartInstallOverview } from '../../lib/hooks/use-pbx-smart-install';
import { usePbxSmartInstallActions } from '../../lib/hooks/use-pbx-smart-install-actions';
import type { PbxSmartDiffNode } from '../../model/types';
import type { PbxSmartTarget } from '../../model/types';

interface SmartInstallPanelProps {
    portalId: number;
    /** Called when user wants to navigate to the installed smart details page */
    onViewSmart?: (smartId: number) => void;
}

// ---------------------------------------------------------------------------
// Single smart row
// ---------------------------------------------------------------------------

interface SmartRowProps {
    node: PbxSmartDiffNode;
    portalId: number;
    onViewSmart?: (smartId: number) => void;
}

function SmartRow({ node, portalId, onViewSmart }: SmartRowProps) {
    const { installNode, syncNode } = usePbxSmartInstallActions();

    const target: PbxSmartTarget = {
        scope: 'smart',
        portalId,
        group: node.group,
        smartCode: node.template.code,
    };

    const missingCategories = node.categories.filter(
        (c) => c.status !== 'installed',
    ).length;
    const missingFields = node.fields.filter(
        (f) => f.status !== 'installed',
    ).length;

    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{node.template.title}</span>
                    <NodeStatusBadge status={node.status} />
                    <span className="text-xs text-muted-foreground">
                        [{node.group} / {node.template.code}]
                    </span>
                </div>

                {node.status !== 'missing' && (
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {node.categories.length > 0 && (
                            <span>
                                Категории: {node.categories.length - missingCategories}/{node.categories.length}
                            </span>
                        )}
                        {node.fields.length > 0 && (
                            <span>
                                Поля: {node.fields.length - missingFields}/{node.fields.length}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-2 shrink-0">
                {node.status === 'missing' && (
                    <Button
                        size="sm"
                        disabled={installNode.isPending}
                        onClick={() => installNode.mutate(target)}
                    >
                        Установить
                    </Button>
                )}

                {node.status === 'partial' && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={syncNode.isPending}
                        onClick={() => syncNode.mutate(target)}
                    >
                        Синхронизировать
                    </Button>
                )}

                {node.installed && onViewSmart && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewSmart(node.installed!.id)}
                    >
                        Открыть
                    </Button>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Panel — grouped by registry group
// ---------------------------------------------------------------------------

export function SmartInstallPanel({
    portalId,
    onViewSmart,
}: SmartInstallPanelProps) {
    const { diffNodes, isLoading } = usePbxSmartInstallOverview(portalId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (diffNodes.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-4">
                Шаблон не содержит смарт-процессов.
            </p>
        );
    }

    // Group by registry group code
    const byGroup = diffNodes.reduce<Record<string, PbxSmartDiffNode[]>>(
        (acc, node) => {
            (acc[node.group] ??= []).push(node);
            return acc;
        },
        {},
    );

    return (
        <div className="space-y-4">
            {Object.entries(byGroup).map(([group, nodes]) => {
                const missingCount = nodes.filter(
                    (n) => n.status === 'missing',
                ).length;
                const partialCount = nodes.filter(
                    (n) => n.status === 'partial',
                ).length;

                return (
                    <Card key={group}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <span className="capitalize">{group}</span>
                                {missingCount > 0 && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {missingCount} не установлено
                                    </span>
                                )}
                                {partialCount > 0 && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        · {partialCount} частично
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nodes.map((node) => (
                                <SmartRow
                                    key={`${node.group}-${node.template.code}`}
                                    node={node}
                                    portalId={portalId}
                                    onViewSmart={onViewSmart}
                                />
                            ))}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
