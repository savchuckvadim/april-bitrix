'use client';
import { PortalMeasureList } from '@/modules/entities/portal-garant/';
import { useParams } from 'next/navigation';

export default function PortalMeasuresPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    
    return <PortalMeasureList portalId={portalId} />;
}
