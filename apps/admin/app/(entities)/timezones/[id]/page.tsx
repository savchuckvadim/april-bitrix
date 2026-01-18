'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTimezone } from '@/modules/entities/timezones/lib/hooks';
import { TimezoneCard } from '@/modules/entities/timezones/ui/timezones-card';
import { Button } from '@workspace/ui/components/button';

export default function TimezoneDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const timezonesId = parseInt(id, 10);
    const { data: timezones, isLoading } = useTimezone(timezonesId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!timezones) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Timezone не найден</h1>
                    <Button onClick={() => router.push('/timezones')}>
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
                    onClick={() => router.push('/timezones')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <TimezoneCard
                item={timezones}
                onEdit={() => router.push(`/timezones/${timezones.id}/edit`)}
                onDelete={() => router.push(`/timezones/${timezones.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
