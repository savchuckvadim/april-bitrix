'use client';

import { useRouter } from 'next/navigation';
import { useCreateInfoGroup, InfoGroupsForm } from '@/modules/entities/garant/info-groups';
import { InfogroupCreateDto } from '@/modules/entities/garant/info-groups/model';

const path = '/garant/info-groups';

export default function NewInfoGroupPage() {
    const router = useRouter();
    const createInfoGroup = useCreateInfoGroup();

    const handleSubmit = (data: InfogroupCreateDto) => {
        createInfoGroup.mutate(data, {
            onSuccess: () => {
                router.push(path);
            },
        });
    };

    const handleCancel = () => {
        router.push(path);
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <InfoGroupsForm
                mode="create"
                onSubmit={(data: InfogroupCreateDto) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createInfoGroup.isPending}
            />
        </div>
    );
}
