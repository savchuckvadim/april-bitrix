'use client';

import React from 'react';
import {
    PBX_FIELD_CODES,
    PbxFieldDateCell,
    PbxFieldSelectBadge,
} from '@/modules/feature/pbx-fields';

interface DealContractCellProps {
    dealId: number;
    /** Код типа договора из DTO отчёта (contract_type). */
    contractTypeCode: string | null;
    /** Название типа из live-словаря бэка (фолбэк до загрузки меты). */
    contractTypeName?: string | null;
    /** Даты действия договора из DTO отчёта (ISO). */
    contractStart: string | null;
    contractEnd: string | null;
}

/**
 * Ячейка «Договор» финансовых таблиц: тип договора (select-бэйдж,
 * с подтверждением) + период действия с—по (редактируемые даты).
 * Одна переиспользуемая ячейка для горячих клиентов и продаж.
 */
export const DealContractCell: React.FC<DealContractCellProps> = ({
    dealId,
    contractTypeCode,
    contractTypeName,
    contractStart,
    contractEnd,
}) => (
    <div className="flex flex-col gap-1">
        <PbxFieldSelectBadge
            fieldCode={PBX_FIELD_CODES.contractType}
            entityId={dealId}
            value={contractTypeCode}
            valueLabel={contractTypeName}
            emptyLabel="тип не задан"
        />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <PbxFieldDateCell
                fieldCode={PBX_FIELD_CODES.contractStart}
                entityId={dealId}
                value={contractStart}
            />
            —
            <PbxFieldDateCell
                fieldCode={PBX_FIELD_CODES.contractEnd}
                entityId={dealId}
                value={contractEnd}
            />
        </span>
    </div>
);
