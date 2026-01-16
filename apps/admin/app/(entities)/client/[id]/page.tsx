'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useClient } from '@/modules/entities/client/lib/hooks';
import { ClientCard } from '@/modules/entities/client/ui/client-card';
import { Button } from '@workspace/ui/components/button';

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
                    <h1 className="text-2xl font-bold mb-4">Client не найден</h1>
                    <Button onClick={() => router.push('/client')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-full">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/client')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <div className="container mx-auto py-8 min-w-full">
                <ClientCard
                    item={client}
                    onEdit={() => router.push(`/client/${client.id}/edit`)}
                    onDelete={() => router.push(`/client/${client.id}/delete`)}
                    onViewDetails={() => { }}
                />
            </div>
        </div>
    );
}
