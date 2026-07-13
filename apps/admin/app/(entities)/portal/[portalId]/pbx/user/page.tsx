'use client';

import { useParams } from 'next/navigation';
import { UserFieldsPanel } from '@/modules/entities/pbx/user';

export default function PbxUserPage() {
    const params = useParams<{ portalId: string }>();
    return <UserFieldsPanel portalId={Number(params.portalId)} />;
}
