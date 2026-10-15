'use client';

import { Suspense, use } from 'react';
import { HooksCatalogPanel, HOOKS_TEXT } from '@/modules/entities/hooks';

/**
 * «Хуки и автоматика» карточки портала: каталог с готовностью хуков на
 * этом портале (поля, стадии, рубильники) и тем, чего не хватает.
 */
export default function PortalHooksPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
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
            <HooksCatalogPanel fixedPortalId={id} />
        </Suspense>
    );
}
