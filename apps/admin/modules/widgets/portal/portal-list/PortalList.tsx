'use client';

import { useRouter } from 'next/navigation';
import { usePortals } from '../../../entities/portal/';
import { PortalTable } from '../portal-table';
import { Button } from '@workspace/ui/components/button';
import { AdminPortalResponseDto } from '@workspace/nest-admin-api';

/**
 * Список порталов. Удаления здесь нет (решение владельца 08.11.2026):
 * портал тянет за собой установки, кабинет и настройки — удалять его из
 * админки одной кнопкой рано.
 */
export function PortalList() {
    const router = useRouter();
    const { data: portals, isLoading } = usePortals();

    const handleRowClick = (portal: AdminPortalResponseDto) => {
        router.push(`/portal/${portal.id}`);
    };

    const handleEdit = (portal: AdminPortalResponseDto) => {
        router.push(`/portal/${portal.id}/edit`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Portals</h1>
                <Button onClick={() => router.push('/portal/new')}>
                    Создать portal
                </Button>
            </div>

            <PortalTable
                data={Array.isArray(portals) ? portals : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
            />
        </div>
    );
}
