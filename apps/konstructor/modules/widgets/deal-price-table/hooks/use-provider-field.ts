'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app';
import { setCurrentProvider } from '@/modules/entities/provider';

/** Поставщик в шапке цен: от него зависит налог (пересчёт — слушатель). */
export const useProviderField = () => {
    const dispatch = useAppDispatch();
    const providers = useAppSelector(
        (state: RootState) => state.documentProvider.items,
    );
    const currentProvider = useAppSelector(
        (state: RootState) => state.documentProvider.current,
    );

    return {
        providers,
        currentProvider,
        setProvider: (id: string) => dispatch(setCurrentProvider(id)),
    };
};
