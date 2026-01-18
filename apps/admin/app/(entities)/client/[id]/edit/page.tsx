'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useClient, useUpdateClient } from '@/modules/entities/client/lib/hooks';
import { ClientForm } from '@/modules/entities/client/ui/client-form';
import { UpdateClientDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditClientPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const clientId = parseInt(id, 10);
    const { data: client, isLoading } = useClient(clientId);
    const updateClient = useUpdateClient();

    const handleSubmit = (data: UpdateClientDto) => {
        updateClient.mutate(
            { id: clientId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/client/${clientId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/client/${clientId}`);
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
        <div className="container mx-auto py-8 max-w-2xl">
            <ClientForm
                mode="edit"
                initialData={client as UpdateClientDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateClient.isPending}
            />
        </div>
    );
}
