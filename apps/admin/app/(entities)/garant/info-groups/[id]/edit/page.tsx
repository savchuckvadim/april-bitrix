'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { InfoGroupsForm, useInfoGroup, useUpdateInfoGroup, } from '@/modules/entities/garant/info-groups';
import { Button } from '@workspace/ui/components/button';
import { InfogroupCreateDto, CreateInfogroupDtoType, CreateInfogroupDtoProductType } from '@/modules/entities/garant/info-groups';

const path = '/garant/info-groups';

export default function EditInfoGroupPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: infoGroup, isLoading } = useInfoGroup(id);
    const updateInfoGroup = useUpdateInfoGroup();

    const handleSubmit = (data: InfogroupCreateDto) => {
        updateInfoGroup.mutate(
            { id, dto: data },
            {
                onSuccess: () => {
                    router.push(`${path}/${id}`);
                },
            }
        );
    };

    const handleCancel = () => {
        router.push(`${path}/${id}`);
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

    if (!infoGroup) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Info Group не найден</h1>
                    <Button onClick={() => router.push(path)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    // Преобразуем InfogroupResponseDto в InfogroupCreateDto для формы
    const initialData: InfogroupCreateDto = {
        number: infoGroup.number,
        code: infoGroup.code,
        name: infoGroup.name,
        title: infoGroup.title,
        type: infoGroup.type as CreateInfogroupDtoType,
        productType: infoGroup.productType as CreateInfogroupDtoProductType,
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <InfoGroupsForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateInfoGroup.isPending}
            />
        </div>
    );
}
