'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/modules/entities/client/ui/client-form';
import { useCreateClient } from '@/modules/entities/client/lib/hooks';
import { CreateClientDto } from '@workspace/nest-api';

export default function NewClientPage() {
    const router = useRouter();
    const createClient = useCreateClient();

    const handleSubmit = (data: CreateClientDto) => {
        createClient.mutate(data, {
            onSuccess: () => {
                router.push('/admin/clients');
            },
        });
    };

    const handleCancel = () => {
        router.push('/admin/clients');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <ClientForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createClient.isPending}
            />
        </div>
    );
}

