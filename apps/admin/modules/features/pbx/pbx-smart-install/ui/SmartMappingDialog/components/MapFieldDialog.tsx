'use client';

import * as React from 'react';
import { MappingDialogShell } from './MappingDialogShell';
import { BxPickerList } from './BxPickerList';
import { useFieldsFromBitrix } from '@/modules/entities/bitrix/smart';
import { usePbxSmartMappingActions } from '../../../lib/hooks/use-pbx-smart-mapping-actions';
import type { PbxSmartInstallContext, PbxMapFieldTarget } from '../../../model/types';

interface MapFieldDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    context: PbxSmartInstallContext;
    fieldCode: string;
    fieldName: string;
    /**
     * entityTypeId of the installed/mapped Bitrix smart.
     * Required to query userfields scoped to that smart.
     */
    bitrixEntityTypeId: number | undefined;
}

export function MapFieldDialog({
    open,
    onOpenChange,
    context,
    fieldCode,
    fieldName,
    bitrixEntityTypeId,
}: MapFieldDialogProps) {
    const { fields, isLoading } = useFieldsFromBitrix(bitrixEntityTypeId);
    const { mapNode } = usePbxSmartMappingActions();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const items = fields.map((f) => ({
        id: f.fieldName,
        label: f.editFormLabel?.ru ?? f.editFormLabel?.en ?? f.fieldName,
        sublabel: `${f.fieldName} · ${f.userTypeId}`,
    }));

    const handleConfirm = () => {
        if (!selectedId) return;
        const target: PbxMapFieldTarget = {
            scope: 'map_field',
            portalId: context.portalId,
            group: context.group,
            smartCode: context.smartCode,
            fieldCode,
            bitrixFieldName: selectedId,
        };
        mapNode.mutate(target, { onSuccess: () => { setSelectedId(null); onOpenChange(false); } });
    };

    return (
        <MappingDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title={`Сопоставить поле «${fieldName}»`}
            canConfirm={!!selectedId}
            isPending={mapNode.isPending}
            onConfirm={handleConfirm}
        >
            {!bitrixEntityTypeId ? (
                <p className="text-sm text-muted-foreground py-2">
                    Смарт не установлен / не сопоставлен — сначала свяжите смарт,
                    чтобы загрузить список его полей из Битрикса.
                </p>
            ) : (
                <BxPickerList
                    items={items}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    isLoading={isLoading}
                    emptyText="Пользовательские поля для этого смарта не найдены."
                />
            )}
        </MappingDialogShell>
    );
}
