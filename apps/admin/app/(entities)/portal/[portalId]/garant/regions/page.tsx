'use client';
import { PortalRegionsList } from '@/modules/entities/portal-garant/';
import { ScrollContentWrapper } from '@/modules/shared/ui';
import { useParams } from 'next/navigation';

export default function PortalRegionsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    return (
        <ScrollContentWrapper>
            <PortalRegionsList portalId={portalId} />
        </ScrollContentWrapper>
    );
}
