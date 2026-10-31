'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BaseProviders } from '@/modules/app/providers/BaseProviders';
import { publicStore } from '../model/public-store';

/** Провайдеры публичной версии: свой стор поверх общей базы. */
export const PublicProviders = ({ children }: { children: ReactNode }) => (
    <Provider store={publicStore}>
        <BaseProviders>{children}</BaseProviders>
    </Provider>
);
