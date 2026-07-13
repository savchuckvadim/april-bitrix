'use client';

import { useParams } from 'next/navigation';
import { PortalContractsPanel } from '@/modules/entities/konstructor/portal-contract';

export default function PortalKonstructorContractPage() {
    const params = useParams<{ portalId: string }>();
    return <PortalContractsPanel portalId={Number(params.portalId)} />;
}
