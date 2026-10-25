'use client';

import { Input } from '@workspace/ui/components/input';
import { ChipSelect, MicroSelect } from '@workspace/april-ui/fields';
import { cn } from '@workspace/ui/lib/utils';
import type { Catalog, KSupply } from '@/modules/entities/catalog';
import { useOdSelect } from '../hooks/use-od-select';

interface OdSelectProps {
    catalog: Catalog;
    supplies: KSupply[];
    value: string;
    disabled?: boolean;
    /** chip — шапка цен (ChipSelect), micro — карточка строки (MicroSelect) */
    variant?: 'chip' | 'micro';
    className?: string;
    onChange: (supplyCode: string) => void;
}

const CUSTOM_LABEL = 'X-ОД — своё количество…';

/** Вид поставки (ОД) с пунктом «X-ОД — своё количество…» на селектах дизайн-системы. */
export const OdSelect = ({
    catalog,
    supplies,
    value,
    disabled = false,
    variant = 'chip',
    className,
    onChange,
}: OdSelectProps) => {
    const od = useOdSelect({ catalog, supplies, value, onChange });

    if (od.customMode) {
        return (
            <Input
                autoFocus
                inputMode="numeric"
                placeholder="Кол-во ОД"
                aria-label="Количество одновременных доступов"
                className={cn(
                    variant === 'micro'
                        ? 'h-6 w-20 px-2 py-0 text-[0.6875rem]'
                        : 'h-7 w-36 px-2 text-xs',
                    className,
                )}
                value={od.customValue}
                onChange={event => od.setCustomValue(event.target.value)}
                onBlur={od.commitCustom}
                onKeyDown={event => {
                    if (event.key === 'Enter') od.commitCustom();
                    if (event.key === 'Escape') od.cancelCustom();
                }}
            />
        );
    }

    if (variant === 'micro') {
        return (
            <MicroSelect
                ariaLabel="Кол-во доступов (ОД)"
                value={value}
                disabled={disabled}
                className={className}
                options={[
                    ...od.options.map(supply => ({ value: supply.code, label: supply.name })),
                    { value: od.customOption, label: CUSTOM_LABEL },
                ]}
                onChange={od.handleSelect}
            />
        );
    }

    return (
        <ChipSelect
            ariaLabel="Кол-во доступов (ОД)"
            value={value}
            disabled={disabled}
            className={className}
            options={[
                ...od.options.map(supply => ({ code: supply.code, name: supply.name })),
                { code: od.customOption, name: CUSTOM_LABEL },
            ]}
            onChange={od.handleSelect}
        />
    );
};
