'use client';

import { useParams } from 'next/navigation';
import { PortalMeasureDetail } from '@/modules/entities/konstructor/portal-measure';

export default function PortalKonstructorMeasureDetailPage() {
    const params = useParams<{ portalId: string; id: string }>();
    return (
        <PortalMeasureDetail
            portalId={Number(params.portalId)}
            id={Number(params.id)}
        />
    );
}
