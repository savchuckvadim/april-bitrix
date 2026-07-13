'use client';

import { useParams } from 'next/navigation';
import { ListPanel } from '@/modules/entities/pbx/list';

export default function PbxListPage() {
    const params = useParams<{ portalId: string }>();
    return <ListPanel portalId={Number(params.portalId)} />;
}