'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { COMPLECT_PATH, useComplect } from '@/modules/entities/garant/complect/index';
import { Button } from '@workspace/ui/index';
import { ComplectEditWidget } from '@/modules/widgets/index';

const path = COMPLECT_PATH;

export default function EditComplectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: complect, isLoading } = useComplect(id);


    const handleCancel = () => {
        router.push(`${path}/${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!complect) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Complect не найден</h1>
                <Button onClick={() => router.push(path)}>
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Редактирование комплекта {complect.name}</h1>
                <Button variant="outline" onClick={handleCancel}>
                    Отмена
                </Button>
            </div>
            <ComplectEditWidget complect={complect} onCancel={handleCancel} />
        </div>
    );
}
