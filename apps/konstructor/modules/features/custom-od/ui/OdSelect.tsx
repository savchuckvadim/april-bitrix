'use client';

import { Input } from '@workspace/ui/components/input';
import { ChipSelect, MicroSegmented, MicroSelect } from '@workspace/april-ui/fields';
import { cn } from '@workspace/ui/lib/utils';
import type { Catalog, KSupply, SupplyKind } from '@/modules/entities/catalog';
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

const TYPE_LABEL: Record<SupplyKind, string> = {
    internet: 'Интернет',
    proxima: 'Проксима',
};

/**
 * Вид поставки (ОД) с пунктом «X-ОД — своё количество…» на селектах
 * дизайн-системы. В X-ОД вид задаётся явно: интернет или Проксима.
 */
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
            <div
                className={cn('flex items-center gap-1', className)}
                // фокус ушёл из группы (не на переключатель вида) — количество принято
                onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) od.commitCustom();
                }}
            >
                {od.availableTypes.length > 1 ? (
                    <MicroSegmented
                        ariaLabel="Вид поставки X-ОД"
                        size={variant === 'micro' ? 'xs' : 'sm'}
                        value={od.customType}
                        options={od.availableTypes.map(type => ({
                            value: type,
                            label: TYPE_LABEL[type],
                        }))}
                        onChange={type => od.setCustomType(type as SupplyKind)}
                    />
                ) : null}
                <Input
                    autoFocus
                    inputMode="numeric"
                    placeholder="Кол-во ОД"
                    aria-label="Количество одновременных доступов"
                    className={
                        variant === 'micro'
                            ? 'h-6 w-20 px-2 py-0 text-[0.6875rem]'
                            : 'h-7 w-28 px-2 text-xs'
                    }
                    value={od.customValue}
                    onChange={event => od.setCustomValue(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') od.commitCustom();
                        if (event.key === 'Escape') od.cancelCustom();
                    }}
                />
            </div>
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
