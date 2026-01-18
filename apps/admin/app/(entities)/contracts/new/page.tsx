'use client';

import { useRouter } from 'next/navigation';
import { ContractForm } from '@/modules/entities/contracts/ui/contracts-form';
import { useCreateContract } from '@/modules/entities/contracts/lib/hooks';
import { CreateContractDto, UpdateContractDto } from '@workspace/nest-api';

export default function NewContractPage() {
    const router = useRouter();
    const createContract = useCreateContract();

    const handleSubmit = (data: CreateContractDto) => {
        createContract.mutate(data, {
            onSuccess: () => {
                router.push('/contracts');
            },
        });
    };

    const handleCancel = () => {
        router.push('/contracts');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <ContractForm
                mode="create"
                onSubmit={(data: CreateContractDto | UpdateContractDto) => handleSubmit(data as CreateContractDto)}
                onCancel={handleCancel}
                isLoading={createContract.isPending}
            />
        </div>
    );
}
