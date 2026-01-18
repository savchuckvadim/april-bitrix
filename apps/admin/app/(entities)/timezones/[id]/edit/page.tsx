'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTimezone, useUpdateTimezone } from '@/modules/entities/timezones/lib/hooks';
import { TimezoneForm } from '@/modules/entities/timezones/ui/timezones-form';
import { UpdateTimezoneDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditTimezonePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const timezonesId = parseInt(id, 10);
    const { data: timezones, isLoading } = useTimezone(timezonesId);
    const updateTimezone = useUpdateTimezone();

    const handleSubmit = (data: UpdateTimezoneDto) => {
        updateTimezone.mutate(
            { id: timezonesId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/timezones/${timezonesId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/timezones/${timezonesId}`);
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
            <TimezoneForm
                mode="edit"
                initialData={timezones as UpdateTimezoneDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateTimezone.isPending}
            />
        </div>
    );
}
