'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import type { Composition } from '@/modules/entities/composition';
import type { CompositionAction } from '@/modules/entities/composition';
import type { Catalog } from '@/modules/entities/catalog';

interface CompositionServicesBlockProps {
    composition: Composition;
    catalog: Catalog;
    onApply: (action: CompositionAction) => void;
}

/** Radix Select не принимает пустое значение — «без выбора» кодируем сентинелом. */
const NONE_OPTION = '__none__';
const fromOption = (value: string): string | null =>
    value === NONE_OPTION ? null : value;

/** Консалтинг (эксклюзивный выбор), СТАР и Академия для выбранной строки */
export const CompositionServicesBlock = ({
    composition,
    catalog,
    onApply,
}: CompositionServicesBlockProps) => (
    <>
        <div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Консалтинг / СТАР
            </div>
            <Select
                value={composition.consalting ?? NONE_OPTION}
                onValueChange={value =>
                    onApply({ kind: 'setConsalting', code: fromOption(value) })
                }
            >
                <SelectTrigger size="sm" className="mb-2 w-full" aria-label="Консалтинг">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE_OPTION}>Только Горячая линия</SelectItem>
                    {catalog.services.consalting
                        .filter(service => service.code !== 'hotline')
                        .map(service => (
                            <SelectItem key={service.code} value={service.code}>
                                {service.name}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
            <Label className="flex items-center gap-2 text-sm font-normal">
                <Checkbox
                    checked={composition.star}
                    onCheckedChange={checked =>
                        onApply({ kind: 'toggleStar', checked: checked === true })
                    }
                />
                СТАР
            </Label>
        </div>
        <div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Академия
            </div>
            <Select
                value={composition.academy ?? NONE_OPTION}
                onValueChange={value =>
                    onApply({ kind: 'setAcademy', code: fromOption(value) })
                }
            >
                <SelectTrigger size="sm" className="w-full" aria-label="Пакет академии">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE_OPTION}>Без академии</SelectItem>
                    {catalog.academy.map(pkg => (
                        <SelectItem key={pkg.code} value={pkg.code}>
                            {pkg.totalHours} ч / {pkg.monthQuantity ?? 'до конца'} мес —{' '}
                            {pkg.price.toLocaleString('ru-RU')} ₽
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </>
);
