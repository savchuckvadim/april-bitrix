'use client';

import type {
    Catalog,
    KComplect,
    KContract,
    KSupply,
} from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import { OdSelect } from '@/modules/features/custom-od';

interface RowRefsSelectsProps {
    row: KRow;
    catalog: Catalog;
    allComplects: KComplect[];
    availableSupplies: KSupply[];
    availableContracts: KContract[];
    disabled: boolean;
    onChange: (
        next: Partial<{
            complectCode: string;
            supplyCode: string;
            contractCode: string;
        }>,
    ) => void;
}

/** Per-row селекты комплект × ОД (с X-ОД) × договор — у каждой garant-строки СВОИ */
export const RowRefsSelects = ({
    row,
    catalog,
    allComplects,
    availableSupplies,
    availableContracts,
    disabled,
    onChange,
}: RowRefsSelectsProps) => (
    <div className="flex flex-wrap gap-2">
        <select
            className="rounded border bg-background px-1.5 py-1 text-xs text-foreground"
            value={row.refs.complectCode ?? ''}
            disabled={disabled}
            onChange={event => onChange({ complectCode: event.target.value })}
        >
            {allComplects.map(complect => (
                <option key={complect.code} value={complect.code}>
                    {complect.title}
                </option>
            ))}
        </select>
        <OdSelect
            catalog={catalog}
            supplies={availableSupplies}
            value={row.refs.supplyCode}
            disabled={disabled}
            className="rounded border bg-background px-1.5 py-1 text-xs text-foreground"
            onChange={supplyCode => onChange({ supplyCode })}
        />
        <select
            className="rounded border bg-background px-1.5 py-1 text-xs text-foreground"
            value={row.refs.contractCode}
            disabled={disabled}
            onChange={event => onChange({ contractCode: event.target.value })}
        >
            {availableContracts.map(contract => (
                <option key={contract.code} value={contract.code}>
                    {contract.name}
                </option>
            ))}
        </select>
    </div>
);
