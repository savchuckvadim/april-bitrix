'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalContract, useUpdatePortalContract } from '@/modules/entities/portal-contracts/lib/hooks';
import { PortalContractForm } from '@/modules/entities/portal-contracts/ui/portalContracts-form';
import { UpdatePortalContractDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditPortalContractPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const portalContractsId = parseInt(id, 10);
    const { data: portalContracts, isLoading } = usePortalContract(portalContractsId);
    const updatePortalContract = useUpdatePortalContract();

    const handleSubmit = (data: UpdatePortalContractDto) => {
        updatePortalContract.mutate(
            { id: portalContractsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/portal-contracts/${portalContractsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/portal-contracts/${portalContractsId}`);
    };

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
            <PortalContractForm
                mode="edit"
                initialData={portalContracts as UpdatePortalContractDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updatePortalContract.isPending}
            />
        </div>
    );
}
