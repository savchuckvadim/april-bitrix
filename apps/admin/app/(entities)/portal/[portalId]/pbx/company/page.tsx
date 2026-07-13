'use client';

import { useParams } from 'next/navigation';
import { CompanyInstallPanel } from '@/modules/entities/pbx/company';

export default function PbxCompanyPage() {
    const params = useParams<{ portalId: string }>();
    return <CompanyInstallPanel portalId={Number(params.portalId)} />;
}
