'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useInfoblock, useUpdateInfoblock, InfoblockCreateDto, InfoblockForm, InfoblockRelationsManager, INFOBLOCK_PATH, toInfoblockFormData } from '@/modules/entities/garant/infoblock';
import { Button } from '@workspace/ui/index';

const path = INFOBLOCK_PATH;

export default function EditInfoblockPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: infoblock, isLoading, refetch: refetchInfoblock } = useInfoblock(id);
    const updateInfoblock = useUpdateInfoblock();

    const handleBack = () => {
        router.push(`${path}`);
    };
    const handleSubmit = (data: InfoblockCreateDto): void => {
        updateInfoblock.mutate(
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

    if (!infoblock) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Infoblock не найден</h1>
                    <Button onClick={handleBack}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    const initialData = toInfoblockFormData(infoblock);

    const handleRelationsSuccess = () => {
        // Обновляем данные инфоблока после изменения связей
        refetchInfoblock();
    };

    return (
        <div className="container mx-auto  space-y-6 ">
            <div className="mb-4 flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Редактирование инфоблока</h1>
                    <p className="text-sm text-gray-500">{infoblock.name}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleBack}
                >
                    ← Назад к списку
                </Button>

            </div>


            <InfoblockForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateInfoblock.isPending}
            />

            {
                infoblock && (
                    <div className="mt-6">
                        <InfoblockRelationsManager
                            infoblockId={id}
                            currentInfoblock={infoblock}
                            onSuccess={handleRelationsSuccess}
                        />
                    </div>
                )
            }
        </div >
    );
}
