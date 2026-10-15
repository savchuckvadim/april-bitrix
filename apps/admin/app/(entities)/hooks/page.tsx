'use client';

import { Suspense } from 'react';
import { HooksCatalogPanel } from '@/modules/entities/hooks';

/**
 * Раздел «Хуки и автоматика»: каталог хуков, пути заявки, холодного
 * обзвона и кронов. Портал выбирается селектором (`?portalId=`) — тогда
 * в строках видна готовность и чего не хватает.
 *
 * Suspense — граница для `useSearchParams` выбранного портала.
 */
export default function HooksPage() {
    return (
        <Suspense fallback={null}>
            <HooksCatalogPanel />
        </Suspense>
    );
}
