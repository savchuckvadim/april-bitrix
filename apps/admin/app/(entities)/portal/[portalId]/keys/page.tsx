'use client';

import { useParams } from 'next/navigation';
import { PortalKeysPanel } from '@/modules/entities/portal/keys';
import { LegacyCredentialsCard } from '@/modules/entities/portal/legacy-credentials';

export default function PortalKeysPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    return (
        <div className="space-y-4">
            <PortalKeysPanel portalId={portalId} />
            <LegacyCredentialsCard portalId={portalId} />
        </div>
    );
}
