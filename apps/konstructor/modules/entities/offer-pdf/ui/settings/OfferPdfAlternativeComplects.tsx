'use client';

import { SwitchField } from '@workspace/april-ui/fields';
import { useAlternativeComplectsField } from './hooks/use-alternative-complects-field';

/** Печатать ли наполнение наборов для сравнения; без таких наборов с наполнением переключателя нет */
export const OfferPdfAlternativeComplects = () => {
    const field = useAlternativeComplectsField();
    if (!field.visible) return null;
    return (
        <SwitchField id={field.id} label={field.label} hint={field.hint} checked={field.checked} onChange={field.change} />
    );
};
