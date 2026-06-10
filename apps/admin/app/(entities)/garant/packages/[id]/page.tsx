'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { PACKAGE_LIST_PATH, usePackage } from '@/modules/entities/garant/package';
import { PackageCard } from '@/modules/entities/garant/package/ui/package-card/PackageCard';

const path = PACKAGE_LIST_PATH;

export default function PackageDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: pkg, isLoading } = usePackage(id);

    const handleEdit = () => {
        router.push(`${path}/${id}/edit`);
    };

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

    if (!pkg) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Package не найден</h1>
                    <Button onClick={handleBack}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="mb-4 flex flex-row justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                >
                    ← Назад к списку
                </Button>
                <Button
                    variant="default"
                    onClick={handleEdit}
                >
                    Редактировать
                </Button>
            </div>

            <PackageCard
                item={pkg}
                onViewDetails={handleEdit}
            />
        </div>
    );
}
