'use client';

import { use } from 'react';
import { AiList } from '@/modules/entities/event/ai';
import { usePortal } from '@/modules/entities/portal';

export default function PortalAiPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    const { data: portal, isLoading } = usePortal(parseInt(portalId, 10));

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
                </div>
            </div>
        );
    }

    // Используем domain из портала
    const domain = portal.domain || portalId;

    return <AiList domain={domain} basePath={`/portal/${portalId}/statistics/ai`} />;
}
