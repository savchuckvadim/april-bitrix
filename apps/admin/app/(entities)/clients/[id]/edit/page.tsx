'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useClient, useUpdateClient } from '@/modules/entities/client/lib/hooks';
import { ClientForm } from '@/modules/entities/client/ui/client-form';
import { UpdateClientDto } from '@workspace/nest-api';

export default function EditClientPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const clientId = parseInt(id, 10);
    const { data: client, isLoading: isLoadingClient } = useClient(clientId);
    const updateClient = useUpdateClient();

    const handleSubmit = (data: UpdateClientDto) => {
        updateClient.mutate(
            { id: clientId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/admin/clients/${clientId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/admin/clients/${clientId}`);
    };

    if (isLoadingClient) {
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
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <ClientForm
                mode="edit"
                initialData={{
                    name: client.name,
                    email: client.email || undefined,
                    status: client.status || undefined,
                    is_active: client.is_active,
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateClient.isPending}
            />
        </div>
    );
}

