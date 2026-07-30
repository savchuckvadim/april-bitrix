'use client';

import { useParams } from 'next/navigation';

import { CabinetWidget } from '@/modules/widgetes/cabinet/ui/CabinetWidget';



export default function PortalDashboardPage() {
    const params = useParams();
    const portalId = params.portalId as string;
console.log('portalId', portalId);

    return (<CabinetWidget />);
}
