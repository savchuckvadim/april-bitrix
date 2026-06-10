'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { TranscriptionCard, useTranscription, TRANSCRIPTION_PATH } from '@/modules/entities/event/transcription';

const path = TRANSCRIPTION_PATH;

export default function TranscriptionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: transcription, isLoading } = useTranscription(id);

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

    if (!transcription) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Транскрипция не найдена</h1>
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
            <TranscriptionCard item={transcription} />
        </div>
    );
}
