'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import type { Catalog } from '@/modules/entities/catalog';
import type { Composition, CompositionAction } from '@/modules/entities/composition';
import { CompositionServiceSection } from './CompositionServiceSection';

interface CompositionStarBlockProps {
    composition: Composition;
    catalog: Catalog;
    /** СТАР встроен в комплект (Эксперт в Закупках): не переключается */
    locked: boolean;
    onApply: (action: CompositionAction) => void;
}

/** СТАР: один пакет, у комплекта со встроенным СТАР — без переключения. */
export const CompositionStarBlock = ({
    composition,
    catalog,
    locked,
    onApply,
}: CompositionStarBlockProps) => (
    <CompositionServiceSection title="СТАР">
        <label className="flex cursor-pointer items-start gap-2 text-sm">
            <Checkbox
                checked={composition.star}
                disabled={locked}
                className="mt-0.5"
                onCheckedChange={checked => onApply({ kind: 'toggleStar', checked: checked === true })}
            />
            <span className="min-w-0">
                {catalog.services.star[0]?.fullName ?? 'Система торговых аналитических решений'}
            </span>
        </label>
        {locked ? (
            <span className="text-xs text-muted-foreground">Входит в комплект, строка бесплатна</span>
        ) : null}
    </CompositionServiceSection>
);
