'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxLead, useUpdateBtxLead } from '@/modules/entities/btx-leads/lib/hooks';
import { BtxLeadForm } from '@/modules/entities/btx-leads/ui/btxLeads-form';
import { UpdateBtxLeadDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBtxLeadPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxLeadsId = parseInt(id, 10);
    const { data: btxLeads, isLoading } = useBtxLead(btxLeadsId);
    const updateBtxLead = useUpdateBtxLead();

    const handleSubmit = (data: UpdateBtxLeadDto) => {
        updateBtxLead.mutate(
            { id: btxLeadsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/btx-leads/${btxLeadsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/btx-leads/${btxLeadsId}`);
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

    if (!btxLeads) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxLead не найден</h1>
                    <Button onClick={() => router.push('/btx-leads')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxLeadForm
                mode="edit"
                initialData={btxLeads as UpdateBtxLeadDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBtxLead.isPending}
            />
        </div>
    );
}
