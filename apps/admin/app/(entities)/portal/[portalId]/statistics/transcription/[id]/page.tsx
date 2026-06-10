'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { TranscriptionCard, useTranscription } from '@/modules/entities/event/transcription';
import { usePortal } from '@/modules/entities/portal';

export default function PortalTranscriptionDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    const router = useRouter();
    const { data: portal, isLoading: isLoadingPortal } = usePortal(parseInt(portalId, 10));
    const { data: transcription, isLoading: isLoadingTranscription } = useTranscription(id);

    const isLoading = isLoadingPortal || isLoadingTranscription;

    const handleBack = () => {
        router.push(`/portal/${portalId}/statistics/transcription`);
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

    if (!portal) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Портал не найден</h1>
                    <Button onClick={() => router.push('/portal')}>
                        Вернуться к списку порталов
                    </Button>
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
                        Вернуться к списку транскрипций
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4">
                <Button variant="outline" onClick={handleBack}>
                    ← Назад к списку транскрипций
                </Button>
            </div>
            <TranscriptionCard item={transcription} />
        </div>
    );
}
