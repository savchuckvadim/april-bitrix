'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixField } from '@/modules/entities/bitrix-fields/lib/hooks';
import { BitrixFieldCard } from '@/modules/entities/bitrix-fields/ui/bitrixFields-card';
import { Button } from '@workspace/ui/components/button';

export default function BitrixFieldDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const bitrixFieldsId = parseInt(id, 10);
    const { data: bitrixFields, isLoading } = useBitrixField(bitrixFieldsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!bitrixFields) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BitrixField не найден</h1>
                    <Button onClick={() => router.push('/bitrix-fields')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/bitrix-fields')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BitrixFieldCard
                item={bitrixFields}
                onEdit={() => router.push(`/bitrix-fields/${bitrixFields.id}/edit`)}
                onDelete={() => router.push(`/bitrix-fields/${bitrixFields.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
