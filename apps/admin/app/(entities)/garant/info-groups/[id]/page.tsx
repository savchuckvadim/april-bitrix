'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { useInfoGroup } from '@/modules/entities/garant/info-groups';
import { InfoGroupsCard } from '@/modules/entities/garant/info-groups/ui/info-groups-card/InfoGroupsCard';
const path = '/garant/info-groups';
export default function InfoGroupDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: infoGroup, isLoading } = useInfoGroup(id);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!infoGroup) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Info Group не найден</h1>
                    <Button onClick={() => router.push(path)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push(path)}
                >
                    ← Назад к списку
                </Button>
            </div>
            <InfoGroupsCard
                item={infoGroup}
                onEdit={() => router.push(`${path}/${infoGroup.id}/edit`)}
                onDelete={() => router.push(`${path}/${infoGroup.id}/delete`)}
                onViewDetails={() => { }}
            />
        </div>
    );
}
