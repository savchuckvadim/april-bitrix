'use client';

import * as React from 'react';
import { MappingDialogShell } from './MappingDialogShell';
import { BxPickerList } from './BxPickerList';
import { usePbxSmartMappingActions } from '../../../lib/hooks/use-pbx-smart-mapping-actions';
import type { BxSmartFullType } from '@/modules/entities/bitrix/smart';
import type { PbxSmartInstallContext, PbxMapCategoryTarget } from '../../../model/types';

interface MapCategoryDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    context: PbxSmartInstallContext;
    categoryCode: string;
    categoryName: string;
    /** The resolved Bitrix smart whose categories are shown for selection */
    bxSmart: BxSmartFullType | undefined;
}

export function MapCategoryDialog({
    open,
    onOpenChange,
    context,
    categoryCode,
    categoryName,
    bxSmart,
}: MapCategoryDialogProps) {
    const { mapNode } = usePbxSmartMappingActions();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const items = (bxSmart?.categories ?? []).map((cat) => ({
        id: String(cat.id),
        label: cat.name,
        sublabel: `id: ${cat.id}`,
    }));

    const handleConfirm = () => {
        if (!selectedId) return;
        const target: PbxMapCategoryTarget = {
            scope: 'map_category',
            portalId: context.portalId,
            group: context.group,
            smartCode: context.smartCode,
            categoryCode,
            bitrixCategoryId: Number(selectedId),
        };
        mapNode.mutate(target, { onSuccess: () => { setSelectedId(null); onOpenChange(false); } });
    };

    return (
        <MappingDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title={`Сопоставить категорию «${categoryName}»`}
            canConfirm={!!selectedId}
            isPending={mapNode.isPending}
            onConfirm={handleConfirm}
        >
            <BxPickerList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                emptyText="Смарт не выбран или в нём нет категорий."
            />
        </MappingDialogShell>
    );
}
