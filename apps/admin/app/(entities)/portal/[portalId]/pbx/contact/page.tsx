'use client';

import { useParams } from 'next/navigation';
import { ContactFieldsPanel } from '@/modules/entities/pbx/contact';

export default function PbxContactPage() {
    const params = useParams<{ portalId: string }>();
    return <ContactFieldsPanel portalId={Number(params.portalId)} />;
}
