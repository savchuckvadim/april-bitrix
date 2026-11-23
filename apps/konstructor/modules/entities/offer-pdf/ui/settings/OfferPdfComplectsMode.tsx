'use client';

import { ChoiceChips } from '@workspace/april-ui/fields';
import { Label } from '@workspace/ui/components/label';
import { useComplectsModeField } from './hooks/use-complects-mode-field';

/** Как печатать наполнение нескольких комплектов: одним списком или разделами по комплектам */
export const OfferPdfComplectsMode = () => {
    const field = useComplectsModeField();
    if (!field.visible) return null;
    return (
        <div className="flex flex-col gap-1.5">
            <Label>Наполнение</Label>
            <ChoiceChips
                options={field.options}
                value={field.value}
                onChange={field.select}
                ariaLabel="Наполнение комплектов"
                collapseBelow="sm"
            />
            <p className="text-xs text-muted-foreground">
                Объединённо: один список без повторов. По комплектам: у каждого комплекта свой раздел с названием и
                поставкой.
            </p>
        </div>
    );
};
