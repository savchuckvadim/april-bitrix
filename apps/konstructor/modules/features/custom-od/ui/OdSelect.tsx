'use client';

import { Input } from '@workspace/ui/components/input';
import { ChipSelect, MicroSegmented, MicroSelect } from '@workspace/april-ui/fields';
import { cn } from '@workspace/ui/lib/utils';
import type { Catalog, KSupply, SupplyKind } from '@/modules/entities/catalog';
import { useOdSelect } from '../hooks/use-od-select';

export type OdSelectVariant = 'chip' | 'micro' | 'field';

interface OdSelectProps {
    catalog: Catalog;
    supplies: KSupply[];
    value: string;
    disabled?: boolean;
    /**
     * chip — шапка цен (ChipSelect), micro — карточка строки (MicroSelect),
     * field — крупный селект во всю ширину колонки (шаг «Комплект»)
     */
    variant?: OdSelectVariant;
    className?: string;
    onChange: (supplyCode: string) => void;
}

const CUSTOM_LABEL = 'X-ОД — своё количество…';

const TYPE_LABEL: Record<SupplyKind, string> = {
    internet: 'Интернет',
    proxima: 'Проксима',
};

/** Поле ввода X-ОД под вариант: размер подгоняется под соседние контролы. */
const CUSTOM_INPUT_CLASS: Record<OdSelectVariant, string> = {
    micro: 'h-6 w-20 px-2 py-0 text-[0.6875rem]',
    chip: 'h-7 w-28 px-2 text-xs',
    field: 'h-10 min-w-0 flex-1 px-3 text-sm',
};

/**
 * Триггер крупного селекта. Базовый триггер задаёт высоту через data-атрибут
 * размера, поэтому высота продублирована под него.
 */
const FIELD_TRIGGER_CLASS = 'h-10 w-full border-solid px-3 text-sm data-[size=sm]:h-10';

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
                className={cn(
                    'flex items-center gap-1',
                    variant === 'field' && 'w-full',
                    className,
                )}
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
                    className={CUSTOM_INPUT_CLASS[variant]}
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
            className={cn(variant === 'field' && FIELD_TRIGGER_CLASS, className)}
            options={[
                ...od.options.map(supply => ({ code: supply.code, name: supply.name })),
                { code: od.customOption, name: CUSTOM_LABEL },
            ]}
            onChange={od.handleSelect}
        />
    );
};
