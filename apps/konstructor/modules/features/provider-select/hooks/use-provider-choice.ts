'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentProvider } from '@/modules/entities/provider';

/** Поставщик документов: от него реквизиты КП/договора и налог в ценах. */
export const useProviderChoice = () => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.documentProvider.items);
    const current = useAppSelector(state => state.documentProvider.current);

    return {
        options: items.map(provider => ({ value: provider.id, label: provider.name })),
        currentId: current?.id ?? null,
        currentName: current?.name ?? null,
        // один поставщик — выбирать нечего
        canChoose: items.length > 1,
        set: (id: string) => dispatch(setCurrentProvider(id)),
    };
};
