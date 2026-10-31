'use client';

import { ChipSelect } from '@workspace/april-ui/fields';
import { useProviderField } from '../hooks/use-provider-field';

/** Поставщик в шапке цен: скрыт, пока список пуст. */
export const ProviderField = () => {
    const field = useProviderField();

    if (!field.providers.length) return null;

    return (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Поставщик
            <ChipSelect
                ariaLabel="Поставщик"
                value={field.currentProvider?.id ?? ''}
                options={field.providers.map(provider => ({
                    code: provider.id,
                    name: provider.name,
                }))}
                onChange={field.setProvider}
            />
        </label>
    );
};
