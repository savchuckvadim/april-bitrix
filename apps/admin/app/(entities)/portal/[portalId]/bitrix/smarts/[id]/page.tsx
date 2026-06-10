'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSmart } from '@/modules/entities/portal-bitrix/btx-smarts/lib/hooks';
import { Button } from '@workspace/ui/components/button';
import {
    getUrlToSmarts,
    getUrlToEditSmart,
} from '@/modules/entities/portal-bitrix/btx-smarts';
import { SmartDetailsWidget } from '@/modules/widgets';

export default function SmartDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    const router = useRouter();
    const parsedPortalId = Number(portalId);
    const smartsId = parseInt(id, 10);
    const { data: smarts, isLoading } = useSmart(smartsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!smarts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Smart не найден</h1>
                    <Button onClick={() => router.push(getUrlToSmarts(parsedPortalId))}>
                        Вернуться к списку
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
                    onClick={() => router.push(getUrlToSmarts(parsedPortalId))}
                >
                    ← Назад к списку
                </Button>
            </div>
            <SmartDetailsWidget
                portalId={parsedPortalId}
                smart={smarts}
                onEdit={() => router.push(getUrlToEditSmart(parsedPortalId, smarts.id))}
                onBack={() => router.push(getUrlToSmarts(parsedPortalId))}
                categoriesEnabled
                onAddCategory={() => router.push(`/portal/${parsedPortalId}/bitrix/btx-categories/new`)}
            />
        </>
    );
}
