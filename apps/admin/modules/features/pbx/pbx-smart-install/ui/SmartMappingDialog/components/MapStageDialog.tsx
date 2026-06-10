'use client';

import * as React from 'react';
import { MappingDialogShell } from './MappingDialogShell';
import { BxPickerList } from './BxPickerList';
import { usePbxSmartMappingActions } from '../../../lib/hooks/use-pbx-smart-mapping-actions';
import type { BxSmartStage } from '@/modules/entities/bitrix/smart';
import type { PbxSmartInstallContext, PbxMapStageTarget } from '../../../model/types';

interface MapStageDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    context: PbxSmartInstallContext;
    categoryCode: string;
    stageCode: string;
    stageName: string;
    bxStages: BxSmartStage[];
}

export function MapStageDialog({
    open,
    onOpenChange,
    context,
    categoryCode,
    stageCode,
    stageName,
    bxStages,
}: MapStageDialogProps) {
    const { mapNode } = usePbxSmartMappingActions();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const items = bxStages.map((stage) => ({
        id: stage.STATUS_ID,
        label: stage.NAME,
        sublabel: stage.STATUS_ID,
    }));

    const handleConfirm = () => {
        if (!selectedId) return;
        const target: PbxMapStageTarget = {
            scope: 'map_stage',
            portalId: context.portalId,
            group: context.group,
            smartCode: context.smartCode,
            categoryCode,
            stageCode,
            bitrixStatusId: selectedId,
        };
        mapNode.mutate(target, { onSuccess: () => { setSelectedId(null); onOpenChange(false); } });
    };

    return (
        <MappingDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title={`Сопоставить стадию «${stageName}»`}
            canConfirm={!!selectedId}
            isPending={mapNode.isPending}
            onConfirm={handleConfirm}
        >
            <BxPickerList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                emptyText="Стадии не загружены или отсутствуют."
            />
        </MappingDialogShell>
    );
}
