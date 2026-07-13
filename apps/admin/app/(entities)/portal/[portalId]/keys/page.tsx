'use client';

import { useParams } from 'next/navigation';
import { PortalKeysPanel } from '@/modules/entities/portal/keys';

export default function PortalKeysPage() {
    const params = useParams<{ portalId: string }>();
    return <PortalKeysPanel portalId={Number(params.portalId)} />;
}
