'use client';

import { Suspense, use } from 'react';
import { HookPage } from '@/modules/entities/hooks';

/** Карточка хука в глобальном разделе; портал — селектором (`?portalId=`). */
export default function HookDetailPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = use(params);
    return (
        <Suspense fallback={null}>
            <HookPage code={decodeURIComponent(code)} />
        </Suspense>
    );
}
