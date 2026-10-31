'use client';

import { FieldCombobox, type ComboboxOption } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { OwnPriceView } from '../../lib/region-draft.util';

interface PortalRegionOwnPriceCellProps {
    regionTitle: string;
    view: OwnPriceView;
    options: ComboboxOption[];
    disabled: boolean;
    isInvalid: boolean;
    onSourceChange: (value: string) => void;
    onAbsChange: (value: string) => void;
    onReset: () => void;
}

/**
 * Своя цена региона: регион-источник, чей рабс брать, или любое число.
 * Выбор одного очищает другое.
 */
export function PortalRegionOwnPriceCell({
    regionTitle,
    view,
    options,
    disabled,
    isInvalid,
    onSourceChange,
    onAbsChange,
    onReset,
}: PortalRegionOwnPriceCellProps) {
    return (
        <div className="flex items-center gap-1">
            <FieldCombobox
                className="min-w-0 flex-1"
                options={options}
                value={view.kind === 'source' ? String(view.regionId) : undefined}
                onChange={onSourceChange}
                placeholder="как у региона…"
                searchPlaceholder="Найти регион"
                emptyText="Регион не найден"
                disabled={disabled}
            />
            <Input
                value={view.kind === 'manual' ? view.abs : ''}
                placeholder="или число"
                inputMode="decimal"
                disabled={disabled}
                aria-label={`Свой рабс: ${regionTitle}`}
                aria-invalid={isInvalid}
                onChange={event => onAbsChange(event.target.value)}
                className="w-28 shrink-0"
            />
            {view.kind !== 'none' && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                    Сбросить
                </Button>
            )}
        </div>
    );
}
