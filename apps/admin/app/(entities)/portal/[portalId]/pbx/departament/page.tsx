'use client';

import { useParams } from 'next/navigation';
import { DepartamentPanel } from '@/modules/entities/pbx/departament';

export default function PbxDepartamentPage() {
    const params = useParams<{ portalId: string }>();
    return <DepartamentPanel portalId={Number(params.portalId)} />;
}
