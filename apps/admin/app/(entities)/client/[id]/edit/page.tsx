'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { UpdateClientDto } from '@workspace/nest-admin-api';
import { ClientForm, useClient, useUpdateClient } from '@/modules/entities/client';

/** Правка организации: название, email, «действует». */
export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const clientId = Number.parseInt(id, 10);
    const { data: client, isLoading } = useClient(clientId);
    const updateClient = useUpdateClient();
    const back = () => router.push(`/client/${clientId}`);

    if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
    if (!client) return <p className="text-sm text-destructive">Клиент не найден</p>;

    return (
        <div className="max-w-2xl">
            <ClientForm
                mode="edit"
                initialData={{
                    name: client.name,
                    email: client.email ?? '',
                    isActive: client.is_active !== false,
                }}
                onSubmit={data => updateClient.mutate({ id: clientId, dto: data as UpdateClientDto }, { onSuccess: back })}
                onCancel={back}
                isLoading={updateClient.isPending}
            />
        </div>
    );
}
