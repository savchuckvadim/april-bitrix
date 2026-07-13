'use client';

import { useParams } from 'next/navigation';
import { PortalMeasuresPanel } from '@/modules/entities/konstructor/portal-measure';

export default function PortalKonstructorMeasurePage() {
    const params = useParams<{ portalId: string }>();
    return <PortalMeasuresPanel portalId={Number(params.portalId)} />;
}
