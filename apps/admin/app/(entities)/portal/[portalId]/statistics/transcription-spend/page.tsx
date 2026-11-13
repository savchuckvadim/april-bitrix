'use client';

import { use } from 'react';
import { usePortal } from '@/modules/entities/portal';
import { PortalSpendView } from '@/modules/entities/transcription-spend';

/** Расход портала на распознавание: по месяцам, дням и сотрудникам. */
export default function PortalTranscriptionSpendPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    const id = parseInt(portalId, 10);
    const { data: portal, isLoading } = usePortal(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }
    if (!portal?.domain) {
        return <p className="py-8 text-center text-muted-foreground">Портал не найден или у него нет домена.</p>;
    }
    return <PortalSpendView portalId={id} domain={portal.domain} />;
}
