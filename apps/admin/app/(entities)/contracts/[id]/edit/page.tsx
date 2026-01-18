'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useContract, useUpdateContract } from '@/modules/entities/contracts/lib/hooks';
import { ContractForm } from '@/modules/entities/contracts/ui/contracts-form';
import { UpdateContractDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditContractPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const contractsId = parseInt(id, 10);
    const { data: contracts, isLoading } = useContract(contractsId);
    const updateContract = useUpdateContract();

    const handleSubmit = (data: UpdateContractDto) => {
        updateContract.mutate(
            { id: contractsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/contracts/${contractsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/contracts/${contractsId}`);
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
            <ContractForm
                mode="edit"
                initialData={contracts as UpdateContractDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateContract.isPending}
            />
        </div>
    );
}
