'use client';

import { useParams } from 'next/navigation';
import { AccountPortal } from '@/modules/features/client-cabinet';

/** Портал в кабинете клиента на сайте. */
export default function AccountPortalPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return <p className="text-sm text-muted-foreground">Портал не найден.</p>;
    }
    return <AccountPortal portalId={portalId} />;
}
