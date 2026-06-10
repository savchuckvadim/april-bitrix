'use client';
import { BxRqList } from '@/modules/entities/portal-bitrix/bx-rqs/ui/bxRqs-list';
import { useParams } from 'next/navigation';

export default function BxRqsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    return <BxRqList portalId={portalId} />;
}
