'use client';

import { useRouter } from 'next/navigation';
import {
    SecretForm,
    SecretFormValues,
    useUpsertSecret,
} from '@/modules/entities/marketplace/secrets';

export default function NewMarketplaceSecretPage() {
    const router = useRouter();
    const upsertSecret = useUpsertSecret();

    const handleSubmit = ({ code, ...dto }: SecretFormValues) => {
        upsertSecret.mutate(
            { code, dto },
            {
                onSuccess: () => {
                    router.push('/marketplace/secrets');
                },
            },
        );
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SecretForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => router.push('/marketplace/secrets')}
                isLoading={upsertSecret.isPending}
            />
        </div>
    );
}
