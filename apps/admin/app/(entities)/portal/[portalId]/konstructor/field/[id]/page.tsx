'use client';

import { useParams } from 'next/navigation';
import { FieldDetail } from '@/modules/entities/konstructor/field';

export default function PortalKonstructorFieldDetailPage() {
    const params = useParams<{ portalId: string; id: string }>();
    return (
        <FieldDetail
            portalId={Number(params.portalId)}
            id={Number(params.id)}
        />
    );
}
