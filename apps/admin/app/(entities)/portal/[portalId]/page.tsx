'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { usePortal } from '@/modules/entities/portal';
import { PortalOverview } from '@/modules/widgets/portal/portal-overview';

/** Карточка портала: сводка — подключение, виджеты, нагрузка, поддержка, AI и ссылки. */
export default function PortalDetailPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    const router = useRouter();
    const { data: portal, isLoading } = usePortal(parseInt(portalId, 10));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    if (!portal) {
        return (
            <div className="py-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Портал не найден</h1>
                <Button onClick={() => router.push('/portal/list')}>Вернуться к списку</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-8">
            <Button variant="outline" size="sm" onClick={() => router.push('/portal/list')}>
                ← К списку порталов
            </Button>
            <PortalOverview portal={portal} />
        </div>
    );
}
