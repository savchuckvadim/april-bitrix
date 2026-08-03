'use client';

import { useState, type ReactNode } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
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
import { Label } from '@workspace/ui/components/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
    /** Второстепенная подпись справа: должность, телефон, отдел. */
    hint?: string;
    /** Дополнительные слова для поиска, если их нет в label. */
    keywords?: string[];
}

export interface FieldComboboxProps {
    label?: ReactNode;
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    /** Действие «создать новый» внизу списка. */
    createLabel?: string;
    onCreate?: () => void;
    error?: ReactNode;
    hint?: ReactNode;
    disabled?: boolean;
    id?: string;
    className?: string;
}

/**
 * Выбор из длинного списка с поиском.
 *
 * Обычный Select не годится, когда вариантов десятки: найти нужный контакт
 * среди пятидесяти прокруткой невозможно. Здесь список фильтруется вводом,
 * а внизу — действие «создать», чтобы не уходить из формы.
 */
export const FieldCombobox = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Выберите значение',
    searchPlaceholder = 'Поиск…',
    emptyText = 'Ничего не найдено',
    createLabel,
    onCreate,
    error,
    hint,
    disabled,
    id,
    className,
}: FieldComboboxProps) => {
    const [open, setOpen] = useState(false);
    const selected = options.find(option => option.value === value);

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <Label htmlFor={id} className="text-xs font-semibold">
                    {label}
                </Label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={!!error}
                        disabled={disabled}
                        className="w-full justify-between font-normal"
                    >
                        <span
                            className={cn(
                                'truncate',
                                !selected && 'text-muted-foreground',
                            )}
                        >
                            {selected?.label ?? placeholder}
                        </span>
                        <ChevronsUpDown
                            aria-hidden
                            className="size-4 shrink-0 opacity-50"
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] p-0"
                >
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map(option => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.label} ${option.hint ?? ''} ${option.keywords?.join(' ') ?? ''}`}
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            aria-hidden
                                            className={cn(
                                                'size-4',
                                                option.value === value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                        {option.hint && (
                                            <span className="ml-auto truncate text-xs text-muted-foreground">
                                                {option.hint}
                                            </span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            {onCreate && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                setOpen(false);
                                                onCreate();
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Plus aria-hidden className="size-4" />
                                            {createLabel ?? 'Создать'}
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : (
                hint && <p className="text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
};
