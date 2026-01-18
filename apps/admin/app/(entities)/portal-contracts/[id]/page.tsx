'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalContract } from '@/modules/entities/portal-contracts/lib/hooks';
import { PortalContractCard } from '@/modules/entities/portal-contracts/ui/portalContracts-card';
import { Button } from '@workspace/ui/components/button';

export default function PortalContractDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const portalContractsId = parseInt(id, 10);
    const { data: portalContracts, isLoading } = usePortalContract(portalContractsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!portalContracts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">PortalContract не найден</h1>
                    <Button onClick={() => router.push('/portal-contracts')}>
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
                    onClick={() => router.push('/portal-contracts')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <PortalContractCard
                item={portalContracts}
                onEdit={() => router.push(`/portal-contracts/${portalContracts.id}/edit`)}
                onDelete={() => router.push(`/portal-contracts/${portalContracts.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
