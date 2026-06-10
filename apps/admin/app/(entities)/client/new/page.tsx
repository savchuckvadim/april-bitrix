'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/modules/entities/client/';
import { useCreateClient } from '@/modules/entities/client/';
import { CreateClientDto, UpdateClientDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui';

export default function NewClientPage() {
    const router = useRouter();
    const createClient = useCreateClient();
    const handleBack = () => router.back()
    const handleSubmit = (data: CreateClientDto | UpdateClientDto) => {
        createClient.mutate(data as CreateClientDto, {
            onSuccess: () => {
                router.push('/client');
            },
        });
    };

    const handleCancel = () => {
        router.push('/client');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4 flex flex-row justify-between">
                <h1 className="text-2xl font-bold">Создание клиента</h1>
                <Button variant="outline" onClick={handleBack}>
                    Назад
                </Button>
            </div>
            <ClientForm
                mode="create"
                onSubmit={(data: CreateClientDto | UpdateClientDto) => handleSubmit(data as CreateClientDto)}
                onCancel={handleCancel}
                isLoading={createClient.isPending}
            />
        </div>
    );
}
