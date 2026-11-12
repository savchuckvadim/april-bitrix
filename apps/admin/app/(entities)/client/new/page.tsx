'use client';

import { useRouter } from 'next/navigation';
import { CreateClientDto, UpdateClientDto } from '@workspace/nest-admin-api';
import { ClientForm, useCreateClient } from '@/modules/entities/client';

/** Новый клиент → сразу на его страницу: там привязка портала и «Что сделать». */
export default function NewClientPage() {
    const router = useRouter();
    const createClient = useCreateClient();

    const handleSubmit = (data: CreateClientDto | UpdateClientDto) => {
        createClient.mutate(data as CreateClientDto, {
            onSuccess: created => router.push(`/client/${created.id}`),
        });
    };

    return (
        <div className="max-w-2xl">
            <ClientForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => router.push('/client')}
                isLoading={createClient.isPending}
            />
        </div>
    );
}
