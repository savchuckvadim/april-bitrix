'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ApplicationCard } from '@/modules/entities/marketplace/applications';

export default function MarketplaceApplicationDetailPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    const router = useRouter();

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/marketplace/applications')}
                >
                    ← Назад к заявкам
                </Button>
            </div>
            <ApplicationCard portalId={portalId} />
        </div>
    );
}
