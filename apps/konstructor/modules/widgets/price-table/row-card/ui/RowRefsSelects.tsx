'use client';

import { MicroSelect } from '@workspace/april-ui/fields';
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
        <MicroSelect
            ariaLabel="Комплект"
            value={row.refs.complectCode ?? ''}
            disabled={disabled}
            options={allComplects.map(complect => ({
                value: complect.code,
                label: complect.title,
            }))}
            onChange={complectCode => onChange({ complectCode })}
        />
        <OdSelect
            variant="micro"
            catalog={catalog}
            supplies={availableSupplies}
            value={row.refs.supplyCode}
            disabled={disabled}
            onChange={supplyCode => onChange({ supplyCode })}
        />
        <MicroSelect
            ariaLabel="Тип договора"
            value={row.refs.contractCode}
            disabled={disabled}
            options={availableContracts.map(contract => ({
                value: contract.code,
                label: contract.name,
            }))}
            onChange={contractCode => onChange({ contractCode })}
        />
    </div>
);
