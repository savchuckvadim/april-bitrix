'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useContract } from '@/modules/entities/contracts/lib/hooks';
import { ContractCard } from '@/modules/entities/contracts/ui/contracts-card';
import { Button } from '@workspace/ui/components/button';

export default function ContractDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const contractsId = parseInt(id, 10);
    const { data: contracts, isLoading } = useContract(contractsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!contracts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Contract не найден</h1>
                    <Button onClick={() => router.push('/contracts')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/contracts')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <ContractCard
                item={contracts}
                onEdit={() => router.push(`/contracts/${contracts.id}/edit`)}
                onDelete={() => router.push(`/contracts/${contracts.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
