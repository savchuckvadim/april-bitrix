'use client';

import { useParams } from 'next/navigation';
import { ProviderPanel } from '@/modules/entities/portal-provider';

export default function PortalProviderPage() {
    const params = useParams<{ portalId: string }>();
    return <ProviderPanel portalId={Number(params.portalId)} />;
}
