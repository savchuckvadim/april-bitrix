'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@workspace/ui/components/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';
import {
    multiComboboxLabel,
    toggleMultiValue,
    type MultiComboboxOption,
} from './multi-combobox.util';

export interface MultiComboboxProps {
    options: readonly MultiComboboxOption[];
    /** Выбранные значения; пусто — «все». */
    value: readonly string[];
    onChange: (value: string[]) => void;
    ariaLabel: string;
    /** Подпись, когда ничего не выбрано: «Все сотрудники». */
    allLabel: string;
    /** Подпись нескольких выбранных; по умолчанию «Выбрано: N». */
    manyLabel?: (count: number) => string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
}

const defaultManyLabel = (count: number): string => `Выбрано: ${count}`;

/**
 * Выбор нескольких значений из списка с поиском — компактная кнопка для
 * строки фильтров. Ничего не выбрано — значит «все»; первая строка списка
 * сбрасывает выбор. Список не закрывается после отметки: выбрать несколько
 * значений можно за одно открытие.
 */
export const MultiCombobox = ({
    options,
    value,
    onChange,
    ariaLabel,
    allLabel,
    manyLabel = defaultManyLabel,
    searchPlaceholder = 'Поиск…',
    emptyText = 'Ничего не найдено',
    disabled,
    className,
}: MultiComboboxProps) => {
    const [open, setOpen] = useState(false);
    const label = multiComboboxLabel(options, value, allLabel, manyLabel);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-label={ariaLabel}
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-7 w-44 justify-between gap-1 px-2 text-xs font-normal',
                        className,
                    )}
                >
                    <span
                        className={cn(
                            'truncate',
                            value.length === 0 && 'text-muted-foreground',
                        )}
                    >
                        {label}
                    </span>
                    <ChevronsUpDown
                        aria-hidden
                        className="size-3 shrink-0 opacity-50"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup forceMount>
                            <CommandItem
                                forceMount
                                value="__all__"
                                onSelect={() => onChange([])}
                                className="cursor-pointer text-xs"
                            >
                                <Check
                                    aria-hidden
                                    className={cn(
                                        'size-4',
                                        value.length === 0
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                    )}
                                />
                                {allLabel}
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            {options.map(option => (
                                <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.value}`}
                                    onSelect={() =>
                                        onChange(
                                            toggleMultiValue(
                                                value,
                                                option.value,
                                            ),
                                        )
                                    }
                                    className="cursor-pointer text-xs"
                                >
                                    <Check
                                        aria-hidden
                                        className={cn(
                                            'size-4',
                                            value.includes(option.value)
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                    {option.hint && (
                                        <span className="ml-auto text-muted-foreground tabular-nums">
                                            {option.hint}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
