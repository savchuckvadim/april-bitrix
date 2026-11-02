'use client';

import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import type { CatalogEntry } from '../../../model';
import { toggleInList } from '../../../lib/methodology-form.util';

interface TypeChipsProps {
    label?: string;
    /** Доступные типы (каталог); пусто — список из allowed. */
    options: readonly CatalogEntry[];
    /** Ограничить выбор этими кодами (типы методики для пункта). */
    allowed?: readonly string[];
    value: readonly string[];
    onChange: (next: string[]) => void;
    size?: 'sm' | 'default';
}

/** Множественный выбор типов звонков бейджами. */
export const TypeChips = ({
    label,
    options,
    allowed,
    value,
    onChange,
    size = 'sm',
}: TypeChipsProps) => {
    const visible = allowed
        ? options.filter(option => allowed.includes(option.code))
        : options;
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <div className="flex flex-wrap gap-1.5">
                {visible.map(option => (
                    <Button
                        key={option.code}
                        type="button"
                        size={size}
                        variant={value.includes(option.code) ? 'default' : 'outline'}
                        className="rounded-full"
                        onClick={() => onChange(toggleInList(value, option.code))}
                    >
                        {option.title}
                    </Button>
                ))}
            </div>
        </div>
    );
};
