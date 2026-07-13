'use client';

import { useParams } from 'next/navigation';
import { GroupPanel } from '@/modules/entities/pbx/group';

export default function PbxGroupPage() {
    const params = useParams<{ portalId: string }>();
    return <GroupPanel portalId={Number(params.portalId)} />;
}
