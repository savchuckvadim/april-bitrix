'use client';

import { useParams } from 'next/navigation';
import { TemplateDetail } from '@/modules/entities/konstructor/template';

export default function PortalKonstructorTemplateDetailPage() {
    const params = useParams<{ portalId: string; id: string }>();
    return (
        <TemplateDetail
            portalId={Number(params.portalId)}
            id={Number(params.id)}
        />
    );
}
