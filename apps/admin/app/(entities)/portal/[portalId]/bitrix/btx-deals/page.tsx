'use client';
import { BtxDealList } from '@/modules/entities/portal-bitrix/btx-deals/ui/btxDeals-list';
import { useParams } from 'next/navigation';

export default function BtxDealsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    return <BtxDealList portalId={portalId} />;
}
