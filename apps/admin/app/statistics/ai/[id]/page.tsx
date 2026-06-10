'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { AiCard, useAiById, AI_PATH } from '@/modules/entities/event/ai';

const path = AI_PATH;

export default function AiDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: ai, isLoading } = useAiById(id);

    const handleBack = () => {
        router.push(path);
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

    if (!ai) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">AI запись не найдена</h1>
                    <Button onClick={handleBack}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4">
                <Button variant="outline" onClick={handleBack}>
                    ← Назад к списку
                </Button>
            </div>
            <AiCard item={ai} />
        </div>
    );
}
