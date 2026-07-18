'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { InstallCard } from '@/modules/entities/marketplace/installs';

export default function MarketplaceInstallDetailPage({
    params,
}: {
    params: Promise<{ installId: string }>;
}) {
    const { installId } = use(params);
    const router = useRouter();

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/marketplace/installs')}
                >
                    ← Назад к установкам
                </Button>
            </div>
            <InstallCard installId={installId} />
        </div>
    );
}
