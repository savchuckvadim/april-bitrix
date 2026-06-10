'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { NodeStatusBadge } from '../../NodeStatusBadge';
import { MapSmartDialog } from '../../SmartMappingDialog';
import { usePbxSmartInstallActions } from '../../../lib/hooks/use-pbx-smart-install-actions';
import type { PbxSmartDiffNode } from '../../../model/types';
import type { PbxSmartInstallContext, PbxSmartTarget } from '../../../model/types';

interface SmartStatusHeaderProps {
    diffNode: PbxSmartDiffNode;
    context: PbxSmartInstallContext;
}

/**
 * Top-level smart header: shows name, status badge, and action buttons.
 * Actions depend on the current status (missing / mapped / partial / installed).
 */
export function SmartStatusHeader({ diffNode, context }: SmartStatusHeaderProps) {
    const { installNode, syncNode } = usePbxSmartInstallActions();
    const [mapOpen, setMapOpen] = React.useState(false);

    const smartTarget: PbxSmartTarget = {
        scope: 'smart',
        portalId: context.portalId,
        group: context.group,
        smartCode: context.smartCode,
    };

    return (
        <>
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">
                            {diffNode.template.title}
                        </span>
                        <NodeStatusBadge status={diffNode.status} />
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                        <span>Группа: {diffNode.group}</span>
                        <span>Код: {diffNode.template.code}</span>
                        {!!diffNode.installed?.entityTypeId && (
                            <span>entityTypeId: {diffNode.installed.entityTypeId}</span>
                        )}
                        {diffNode.installed?.bitrixId && (
                            <span>bitrixId: {String(diffNode.installed.bitrixId)}</span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap">
                    {diffNode.status === 'missing' && (
                        <>
                            <Button
                                size="sm"
                                disabled={installNode.isPending}
                                onClick={() => installNode.mutate(smartTarget)}
                            >
                                Установить
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMapOpen(true)}
                            >
                                Сопоставить
                            </Button>
                        </>
                    )}
                    {diffNode.status === 'mapped' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMapOpen(true)}
                        >
                            Переназначить
                        </Button>
                    )}
                    {diffNode.status === 'partial' && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={syncNode.isPending}
                            onClick={() => syncNode.mutate(smartTarget)}
                        >
                            Синхронизировать всё
                        </Button>
                    )}
                </div>
            </div>

            <MapSmartDialog
                open={mapOpen}
                onOpenChange={setMapOpen}
                context={context}
                templateTitle={diffNode.template.title}
            />
        </>
    );
}
