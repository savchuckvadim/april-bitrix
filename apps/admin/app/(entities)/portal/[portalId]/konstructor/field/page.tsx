'use client';

import { useParams } from 'next/navigation';
import { FieldsTable } from '@/modules/entities/konstructor/field';

export default function PortalKonstructorFieldPage() {
    const params = useParams<{ portalId: string }>();
    return <FieldsTable portalId={Number(params.portalId)} />;
}
