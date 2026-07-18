'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
    SecretForm,
    SecretFormValues,
    useSecret,
    useUpsertSecret,
} from '@/modules/entities/marketplace/secrets';

export default function EditMarketplaceSecretPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = use(params);
    const router = useRouter();
    const { data: secret, isLoading } = useSecret(code);
    const upsertSecret = useUpsertSecret();

    const handleSubmit = ({ code: formCode, ...dto }: SecretFormValues) => {
        upsertSecret.mutate(
            { code: formCode || code, dto },
            {
                onSuccess: () => {
                    router.push('/marketplace/secrets');
                },
            },
        );
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

    if (!secret) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Креды не найдены</h1>
                    <Button onClick={() => router.push('/marketplace/secrets')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SecretForm
                mode="edit"
                initialData={secret}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/marketplace/secrets')}
                isLoading={upsertSecret.isPending}
            />
        </div>
    );
}
