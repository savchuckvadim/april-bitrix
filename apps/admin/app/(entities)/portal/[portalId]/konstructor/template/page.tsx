'use client';

import { useParams } from 'next/navigation';
import { TemplatesPanel } from '@/modules/entities/konstructor/template';

export default function PortalKonstructorTemplatePage() {
    const params = useParams<{ portalId: string }>();
    return <TemplatesPanel portalId={Number(params.portalId)} />;
}
