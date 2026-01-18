'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/modules/entities/client/ui/client-form';
import { useCreateClient } from '@/modules/entities/client/lib/hooks';
import { CreateClientDto, UpdateClientDto } from '@workspace/nest-api';

export default function NewClientPage() {
    const router = useRouter();
    const createClient = useCreateClient();

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
            <ClientForm
                mode="create"
                onSubmit={(data: CreateClientDto | UpdateClientDto) => handleSubmit(data as CreateClientDto)}
                onCancel={handleCancel}
                isLoading={createClient.isPending}
            />
        </div>
    );
}
