'use client';

import { useParams } from 'next/navigation';
import { ContractDetail } from '@/modules/entities/konstructor/contract';

export default function KonstructorContractDetailPage() {
    const params = useParams<{ id: string }>();
    return <ContractDetail id={Number(params.id)} />;
}
