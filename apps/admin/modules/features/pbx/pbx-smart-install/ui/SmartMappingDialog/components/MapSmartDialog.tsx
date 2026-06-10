'use client';

import * as React from 'react';
import { MappingDialogShell } from './MappingDialogShell';
import { BxPickerList } from './BxPickerList';
import { useSmartsFromBitrix } from '@/modules/entities/bitrix/smart';
import { usePbxSmartMappingActions } from '../../../lib/hooks/use-pbx-smart-mapping-actions';
import type { PbxSmartInstallContext, PbxMapSmartTarget } from '../../../model/types';

interface MapSmartDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    context: PbxSmartInstallContext;
    templateTitle: string;
}

export function MapSmartDialog({
    open,
    onOpenChange,
    context,
    templateTitle,
}: MapSmartDialogProps) {
    const { smarts, isLoading } = useSmartsFromBitrix();
    const { mapNode } = usePbxSmartMappingActions();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const items = smarts.map((s) => ({
        id: String(s.entityTypeId),
        label: s.title,
        sublabel: `entityTypeId: ${s.entityTypeId}`,
    }));

    const handleConfirm = () => {
        if (!selectedId) return;
        const target: PbxMapSmartTarget = {
            scope: 'map_smart',
            portalId: context.portalId,
            group: context.group,
            smartCode: context.smartCode,
            bitrixEntityTypeId: Number(selectedId),
        };
        mapNode.mutate(target, { onSuccess: () => { setSelectedId(null); onOpenChange(false); } });
    };

    return (
        <MappingDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title={`Сопоставить «${templateTitle}» с Битрикс смартом`}
            canConfirm={!!selectedId}
            isPending={mapNode.isPending}
            onConfirm={handleConfirm}
        >
            <BxPickerList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isLoading={isLoading}
                emptyText="Смарт-процессы не найдены на портале."
            />
        </MappingDialogShell>
    );
}
