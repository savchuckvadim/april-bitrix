'use client';

import { useForm } from 'react-hook-form';
import type { UpdatePortalRegionDto } from '../../model';

/**
 * Форма своей цены: ручной рабс и регион-источник вытесняют друг друга.
 * values вместо defaultValues: данные формы приходят после монтирования.
 */
export const usePortalRegionForm = (initialData?: UpdatePortalRegionDto) => {
    const form = useForm<UpdatePortalRegionDto>({ values: initialData });
    const sourceId = form.watch('own_abs_region_id');

    const setSource = (value: string): void => {
        form.setValue('own_abs_region_id', Number(value), { shouldDirty: true });
        form.setValue('own_abs', null, { shouldDirty: true });
    };

    const clearOwnPrice = (): void => {
        form.setValue('own_abs_region_id', null, { shouldDirty: true });
        form.setValue('own_abs', null, { shouldDirty: true });
    };

    return {
        ownAbsField: form.register('own_abs', {
            onChange: () => form.setValue('own_abs_region_id', null),
        }),
        ownTaxField: form.register('own_tax'),
        ownTaxAbsField: form.register('own_tax_abs'),
        regionCodeField: form.register('regionCode'),
        sourceValue: sourceId ? String(sourceId) : undefined,
        setSource,
        clearOwnPrice,
        handleSubmit: form.handleSubmit,
    };
};
