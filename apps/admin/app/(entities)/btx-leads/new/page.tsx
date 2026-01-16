'use client';

import { useRouter } from 'next/navigation';
import { BtxLeadForm } from '@/modules/entities/btx-leads/ui/btxLeads-form';
import { useCreateBtxLead } from '@/modules/entities/btx-leads/lib/hooks';
import { CreateBtxLeadDto, UpdateBtxLeadDto } from '@workspace/nest-api';

export default function NewBtxLeadPage() {
    const router = useRouter();
    const createBtxLead = useCreateBtxLead();

    const handleSubmit = (data: CreateBtxLeadDto | UpdateBtxLeadDto) => {
        createBtxLead.mutate(data as CreateBtxLeadDto, {
            onSuccess: () => {
                router.push('/btx-leads');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-leads');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxLeadForm
                mode="create"
                onSubmit={(data: CreateBtxLeadDto | UpdateBtxLeadDto) => handleSubmit(data as CreateBtxLeadDto)}
                onCancel={handleCancel}
                isLoading={createBtxLead.isPending}
            />
        </div>
    );
}
