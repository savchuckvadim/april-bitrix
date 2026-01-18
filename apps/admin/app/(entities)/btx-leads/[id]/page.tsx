'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxLead } from '@/modules/entities/btx-leads/lib/hooks';
import { BtxLeadCard } from '@/modules/entities/btx-leads/ui/btxLeads-card';
import { Button } from '@workspace/ui/components/button';

export default function BtxLeadDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxLeadsId = parseInt(id, 10);
    const { data: btxLeads, isLoading } = useBtxLead(btxLeadsId);

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
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/btx-leads')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BtxLeadCard
                item={btxLeads}
                onEdit={() => router.push(`/btx-leads/${btxLeads.id}/edit`)}
                onDelete={() => router.push(`/btx-leads/${btxLeads.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
