'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { INFOBLOCK_PATH, useInfoblock } from '@/modules/entities/garant/infoblock';
import { InfoblockCard } from '@/modules/entities/garant/infoblock/ui/infoblock-card/InfoblockCard';
const path = INFOBLOCK_PATH
export default function InfoblockDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: infoblock, isLoading } = useInfoblock(id);
    const handleEdit = () => {
        router.push(`${path}/${id}/edit`);
    };
    const handleBack = () => {
        router.push(path)
    }
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

    return (
        <div className="container mx-auto ">
            <div className="mb-4 flex flex-row justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                >
                    ← Назад к списку
                </Button>
                <Button
                    variant="default"
                    onClick={handleEdit}
                >
                    Редактировать
                </Button>
            </div>


            <InfoblockCard
                item={infoblock}
                onViewDetails={handleEdit}
            />
        </div>
    );
}
