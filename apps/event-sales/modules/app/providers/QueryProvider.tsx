'use client';

import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getAppQueryClient } from '../lib/query-client';

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * react-query для слайсов, читающих Битрикс напрямую (первый — ЗПР).
 * Клиент — синглтон из lib/query-client: к кэшу дотягиваются и листенеры
 * стора (инвалидация вне React).
 */
export function QueryProvider({ children }: QueryProviderProps) {
    const [client] = useState(getAppQueryClient);

    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
}
