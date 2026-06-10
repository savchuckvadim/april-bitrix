'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBxRq } from '@/modules/entities/portal-bitrix/bx-rqs/lib/hooks';
import { Button } from '@workspace/ui/components/button';
import { RqDetailsWidget } from '@/modules/widgets';

export default function BxRqDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    const router = useRouter();
    const parsedPortalId = Number(portalId);
    const bxRqId = parseInt(id, 10);
    const { data: bxRq, isLoading } = useBxRq(bxRqId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!bxRq) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BxRq не найден</h1>
                    <Button onClick={() => router.back()}>
                        Вернуться назад
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    ← Назад к списку
                </Button>
            </div>
            <RqDetailsWidget
                portalId={parsedPortalId}
                rq={bxRq}
                onEdit={() => router.push(`/portal/${parsedPortalId}/bitrix/bx-rqs/${bxRq.id}/edit`)}
                onBack={() => router.back()}
            />
        </>
    );
}
