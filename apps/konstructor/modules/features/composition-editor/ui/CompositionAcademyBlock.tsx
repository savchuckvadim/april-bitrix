'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { academyPackageLabel, type KAcademyPackage } from '@/modules/entities/catalog';
import type { CompositionAction } from '@/modules/entities/composition';
import { CompositionServiceSection } from './CompositionServiceSection';

interface CompositionAcademyBlockProps {
    academy: {
        termMonths: number | null;
        options: KAcademyPackage[];
        current: KAcademyPackage | null;
        currentFits: boolean;
    };
    onApply: (action: CompositionAction) => void;
}

/** Radix Select не принимает пустое значение — «без выбора» кодируем сентинелом. */
const NONE_OPTION = '__none__';

/**
 * Академия ГАРАНТ: пакеты под срок сделки (количество × договор), как в
 * легаси-окне. Пакет, переставший подходить, остаётся выбранным с
 * предупреждением: строка вернётся, когда срок снова совпадёт.
 */
export const CompositionAcademyBlock = ({ academy, onApply }: CompositionAcademyBlockProps) => (
    <CompositionServiceSection title="Академия ГАРАНТ">
        <Select
            value={academy.current?.code ?? NONE_OPTION}
            onValueChange={value =>
                onApply({ kind: 'setAcademy', code: value === NONE_OPTION ? null : value })
            }
        >
            <SelectTrigger size="sm" className="w-full" aria-label="Пакет академии">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={NONE_OPTION}>Без академии</SelectItem>
                {academy.options.map(pkg => (
                    <SelectItem key={pkg.code} value={pkg.code}>
                        {academyPackageLabel(pkg)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
            {academy.termMonths === null
                ? 'Срок сделки появится после выбора договора'
                : `Срок сделки ${academy.termMonths} мес: количество × договор`}
        </span>
        {!academy.currentFits ? (
            <span className="text-xs text-warning">
                Пакет не подходит под срок сделки: строки не будет, пока срок не совпадёт
            </span>
        ) : null}
    </CompositionServiceSection>
);
