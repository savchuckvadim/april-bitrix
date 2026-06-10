'use client';

import { useRouter } from 'next/navigation';
import { useCreateInfoblock, InfoblockCreateDto, InfoblockForm, INFOBLOCK_PATH } from '@/modules/entities/garant/infoblock';
import { Button } from '@workspace/ui/components';

const path = INFOBLOCK_PATH;

export default function NewInfoblockPage() {
    const router = useRouter();
    const createInfoblock = useCreateInfoblock();
    const handleBack = () => router.back()
    const handleSubmit = (data: InfoblockCreateDto) => {
        createInfoblock.mutate(data, {
            onSuccess: (response) => {
                router.push(`${path}/edit/${response.id}`);
            },
            onError: (error: Error) => {
                // Ошибка будет обработана через createInfoblock.error
                console.error('Error creating infoblock:', error);
            },
        });
    };

    const handleCancel = () => {
        router.push(path);
    };
    const initialData: InfoblockCreateDto = {
        number: 0,
        name: '',
        code: '',
        weight: '',
        isLa: false,
        isFree: false,
        isShowing: false,
        isSet: false,
        isProduct: false,
        isPackage: false,
        group_id: '',
    };

    return (
        <div className="container mx-auto ">
            <div className="mb-4 flex flex-row justify-between">
                <h1 className="text-2xl font-bold">Создание инфоблока</h1>
                <Button variant="outline" onClick={handleBack}>
                    Назад
                </Button>
            </div>
            <InfoblockForm
                mode="create"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createInfoblock.isPending}
                serverError={createInfoblock.error}
            />
        </div>
    );
}
