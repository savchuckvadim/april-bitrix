'use client';

import { useRouter } from 'next/navigation';
import { PortalContractForm } from '@/modules/entities/portal-contracts/ui/portalContracts-form';
import { useCreatePortalContract } from '@/modules/entities/portal-contracts/lib/hooks';
import { CreatePortalContractDto, UpdatePortalContractDto } from '@workspace/nest-api';

export default function NewPortalContractPage() {
    const router = useRouter();
    const createPortalContract = useCreatePortalContract();

    const handleSubmit = (data: CreatePortalContractDto) => {
        createPortalContract.mutate(data, {
            onSuccess: () => {
                router.push('/portal-contracts');
            },
        });
    };

    const handleCancel = () => {
        router.push('/portal-contracts');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PortalContractForm
                mode="create"
                onSubmit={(data: CreatePortalContractDto | UpdatePortalContractDto) => handleSubmit(data as CreatePortalContractDto)}
                onCancel={handleCancel}
                isLoading={createPortalContract.isPending}
            />
        </div>
    );
}
