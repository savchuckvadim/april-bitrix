'use client';

import type { Catalog, KSupply } from '@/modules/entities/catalog';
import { useOdSelect } from '../hooks/use-od-select';

interface OdSelectProps {
    catalog: Catalog;
    supplies: KSupply[];
    value: string;
    disabled?: boolean;
    className?: string;
    onChange: (supplyCode: string) => void;
}

/** Вид поставки (ОД) с пунктом «X-ОД — своё количество…» */
export const OdSelect = ({
    catalog,
    supplies,
    value,
    disabled = false,
    className,
    onChange,
}: OdSelectProps) => {
    const od = useOdSelect({ catalog, supplies, value, onChange });

    if (od.customMode) {
        return (
            <span className="flex items-center gap-1">
                <input
                    autoFocus
                    inputMode="numeric"
                    placeholder="Кол-во ОД"
                    className={
                        className ??
                        'w-24 rounded border bg-background px-2 py-1.5 text-sm text-foreground'
                    }
                    value={od.customValue}
                    onChange={event => od.setCustomValue(event.target.value)}
                    onBlur={od.commitCustom}
                    onKeyDown={event => {
                        if (event.key === 'Enter') od.commitCustom();
                        if (event.key === 'Escape') od.cancelCustom();
                    }}
                />
            </span>
        );
    }

    return (
        <select
            className={
                className ??
                'rounded border bg-background px-2 py-1.5 text-sm text-foreground'
            }
            value={value}
            disabled={disabled}
            onChange={event => od.handleSelect(event.target.value)}
        >
            {od.options.map(supply => (
                <option key={supply.code} value={supply.code}>
                    {supply.name}
                </option>
            ))}
            <option value={od.customOption}>X-ОД — своё количество…</option>
        </select>
    );
};
