'use client';

import { useParams } from 'next/navigation';
import { RqPanel } from '@/modules/entities/pbx/rq';

export default function PbxRqPage() {
    const params = useParams<{ portalId: string }>();
    return <RqPanel portalId={Number(params.portalId)} />;
}
