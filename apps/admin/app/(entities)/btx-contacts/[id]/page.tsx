'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxContact } from '@/modules/entities/btx-contacts/lib/hooks';
import { BtxContactCard } from '@/modules/entities/btx-contacts/ui/btxContacts-card';
import { Button } from '@workspace/ui/components/button';

export default function BtxContactDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxContactsId = parseInt(id, 10);
    const { data: btxContacts, isLoading } = useBtxContact(btxContactsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!btxContacts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxContact не найден</h1>
                    <Button onClick={() => router.push('/btx-contacts')}>
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
                    onClick={() => router.push('/btx-contacts')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BtxContactCard
                item={btxContacts}
                onEdit={() => router.push(`/btx-contacts/${btxContacts.id}/edit`)}
                onDelete={() => router.push(`/btx-contacts/${btxContacts.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
