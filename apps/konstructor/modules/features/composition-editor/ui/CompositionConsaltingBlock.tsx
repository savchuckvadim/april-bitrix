'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import type { Catalog } from '@/modules/entities/catalog';
import type { Composition, CompositionAction } from '@/modules/entities/composition';
import { CompositionServiceSection } from './CompositionServiceSection';

interface CompositionConsaltingBlockProps {
    composition: Composition;
    catalog: Catalog;
    onApply: (action: CompositionAction) => void;
}

/** Radix Select не принимает пустое значение — «без выбора» кодируем сентинелом. */
const NONE_OPTION = '__none__';

/** Платный консалтинг: один из каталога или только горячая линия. */
export const CompositionConsaltingBlock = ({
    composition,
    catalog,
    onApply,
}: CompositionConsaltingBlockProps) => (
    <CompositionServiceSection title="Консалтинг">
        <Select
            value={composition.consalting ?? NONE_OPTION}
            onValueChange={value =>
                onApply({ kind: 'setConsalting', code: value === NONE_OPTION ? null : value })
            }
        >
            <SelectTrigger size="sm" className="w-full" aria-label="Консалтинг">
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
    </CompositionServiceSection>
);
