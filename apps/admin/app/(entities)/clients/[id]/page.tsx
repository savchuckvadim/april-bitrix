'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useClient } from '@/modules/entities/client/lib/hooks';
import { ClientCard } from '@/modules/entities/client/ui/client-card';
import { Button } from '@workspace/ui/components/button';
import { ClientWithRelationsResponseDto } from '@workspace/nest-api';

export default function ClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const clientId = parseInt(id, 10);
    const { data: client, isLoading } = useClient(clientId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Клиент не найден</h1>
                    <Button onClick={() => router.push('/admin/clients')}>
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
                    onClick={() => router.push('/admin/clients')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <ClientCard
                item={client as ClientWithRelationsResponseDto}
                onEdit={() => router.push(`/admin/clients/${client.id}/edit`)}
                onDelete={() => router.push(`/admin/clients/${client.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}

