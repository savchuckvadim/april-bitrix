'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './ApiProvider';
import { BaseProviders } from './BaseProviders';

/** Провайдеры фрейма: стор со сделкой и порталом поверх общей базы. */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <BaseProviders>
                <ApiProvider>{children}</ApiProvider>
            </BaseProviders>
        </Provider>
    );
}
