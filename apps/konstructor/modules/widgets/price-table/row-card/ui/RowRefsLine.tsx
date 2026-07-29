'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { resolveSupply, type Catalog } from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import type {
    KComplect,
    KContract,
    KSupply,
} from '@/modules/entities/catalog';
import { RowRefsSelects } from './RowRefsSelects';

interface RowRefsLineProps {
    row: KRow;
    catalog: Catalog;
    allComplects: KComplect[];
    availableSupplies: KSupply[];
    availableContracts: KContract[];
    canEdit: boolean;
    onChange: (
        next: Partial<{
            complectCode: string;
            supplyCode: string;
            contractCode: string;
        }>,
    ) => void;
}

/**
 * Рефы garant-строки — читаемой строкой «Вид поставки • Договор • мера»
 * (легаси NoFunctionalSupplyArea); ⚙ раскрывает селекты правки
 * (комплект / ОД с X-ОД / договор) — редактирование по требованию,
 * а не вечные селекты.
 */
export const RowRefsLine = ({
    row,
    catalog,
    allComplects,
    availableSupplies,
    availableContracts,
    canEdit,
    onChange,
}: RowRefsLineProps) => {
    const [editing, setEditing] = useState(false);
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    const contract = catalog.contracts.byCode[row.refs.contractCode];

    if (editing && canEdit) {
        return (
            <div className="flex items-center gap-2">
                <RowRefsSelects
                    row={row}
                    catalog={catalog}
                    allComplects={allComplects}
                    availableSupplies={availableSupplies}
                    availableContracts={availableContracts}
                    disabled={false}
                    onChange={onChange}
                />
                <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                    готово
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>
                {[supply?.name, contract?.name, row.price.measure.name]
                    .filter(Boolean)
                    .join(' • ')}
            </span>
            {canEdit ? (
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    aria-label="Изменить комплект / ОД / договор"
                    title="Изменить комплект / ОД / договор"
                    className="rounded p-0.5 hover:bg-muted hover:text-foreground"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                </button>
            ) : null}
        </div>
    );
};
