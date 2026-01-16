'use client';

import { useRouter } from 'next/navigation';
import { TimezoneForm } from '@/modules/entities/timezones/ui/timezones-form';
import { useCreateTimezone } from '@/modules/entities/timezones/lib/hooks';
import { CreateTimezoneDto, UpdateTimezoneDto } from '@workspace/nest-api';

export default function NewTimezonePage() {
    const router = useRouter();
    const createTimezone = useCreateTimezone();

    const handleSubmit = (data: CreateTimezoneDto) => {
        createTimezone.mutate(data, {
            onSuccess: () => {
                router.push('/timezones');
            },
        });
    };

    const handleCancel = () => {
        router.push('/timezones');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <TimezoneForm
                mode="create"
                onSubmit={(data: CreateTimezoneDto | UpdateTimezoneDto) => handleSubmit(data as CreateTimezoneDto)}
                onCancel={handleCancel}
                isLoading={createTimezone.isPending}
            />
        </div>
    );
}
