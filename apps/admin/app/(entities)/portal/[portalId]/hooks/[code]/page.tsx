'use client';

import { Suspense, use } from 'react';
import { HookPage, HOOKS_TEXT } from '@/modules/entities/hooks';

/** Карточка хука на портале: готовность, настройки и мониторинг этого портала. */
export default function PortalHookDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; code: string }>;
}) {
    const { portalId, code } = use(params);
    const id = Number(portalId);

    if (!Number.isInteger(id) || id <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {HOOKS_TEXT.invalidPortalId}
            </p>
        );
    }

    return (
        <Suspense fallback={null}>
            <HookPage code={decodeURIComponent(code)} fixedPortalId={id} />
        </Suspense>
    );
}
