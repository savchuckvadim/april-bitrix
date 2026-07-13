'use client';

import { useParams } from 'next/navigation';
import { PortalContractDetail } from '@/modules/entities/konstructor/portal-contract';

export default function PortalKonstructorContractDetailPage() {
    const params = useParams<{ portalId: string; id: string }>();
    return (
        <PortalContractDetail
            portalId={Number(params.portalId)}
            id={Number(params.id)}
        />
    );
}
