'use client';
import { PortalContractList } from '@/modules/entities/portal-garant/portal-contracts/ui/portalContracts-list';
import { useParams } from 'next/navigation';

export default function PortalContractsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    return <PortalContractList portalId={portalId} />;
}
