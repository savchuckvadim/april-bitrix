'use client';

import { useParams } from 'next/navigation';
import { NumeratorsPanel } from '@/modules/entities/konstructor/numerator';

export default function PortalKonstructorNumeratorPage() {
    const params = useParams<{ portalId: string }>();
    return <NumeratorsPanel portalId={Number(params.portalId)} />;
}
