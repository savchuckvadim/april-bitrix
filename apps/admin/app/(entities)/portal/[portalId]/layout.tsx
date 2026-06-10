'use client';

import { use, useEffect } from 'react';
import { useAppDispatch } from '@/modules/app';
import { fetchCurrentPortal } from '@/modules/entities/portal';

/**
 * Client layout для всех страниц внутри /portal/[portalId].
 *
 * При монтировании (и при смене portalId) диспатчит fetchCurrentPortal,
 * который записывает полный объект портала (включая domain) в Redux.
 * Это позволяет любому потомку получить текущий портал через useCurrentPortal()
 * без пробрасывания portalId через пропсы.
 */
export default function PortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    const dispatch = useAppDispatch();
    const parsedId = Number(portalId);

    useEffect(() => {
        if (parsedId) {
            dispatch(fetchCurrentPortal({ portalId: parsedId }));
        }
    }, [parsedId, dispatch]);

    return <>{children}</>;
}
