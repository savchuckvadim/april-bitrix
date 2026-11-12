'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientResponseDto } from '@workspace/nest-admin-api';
import { Button } from '@workspace/ui/components/button';
import { usePortals } from '@/modules/entities/portal';
import { useClients } from '../../lib/hooks';
import { ClientTable } from '../../ui/client-table';

/**
 * «Клиенты» — организации, которым принадлежат порталы. Все, без фильтра по
 * статусу: и заведённые вручную, и пришедшие заявкой из приложения.
 */
export function ClientList() {
    const router = useRouter();
    // Пустые фильтры = все организации (бэк применяет только непустые).
    const { data: clients, isLoading } = useClients({ status: '', is_active: '' });
    const { data: portals } = usePortals();

    const portalsByClient = useMemo(() => {
        const map = new Map<number, string[]>();
        for (const portal of portals ?? []) {
            if (!portal.client_id || !portal.domain) continue;
            map.set(portal.client_id, [...(map.get(portal.client_id) ?? []), portal.domain]);
        }
        return map;
    }, [portals]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Клиенты</h1>
                    <p className="text-sm text-muted-foreground">
                        Организации, которым принадлежат порталы. Клиента для портала удобнее заводить на самом
                        портале: вкладка «Кабинет» → «Создать организацию» — портал привяжется сразу.{' '}
                        <Link href="/marketplace/cabinet-guide" className="text-primary hover:underline">
                            Путеводитель
                        </Link>
                    </p>
                </div>
                <Button onClick={() => router.push('/client/new')}>Создать клиента</Button>
            </div>

            <ClientTable
                data={Array.isArray(clients) ? clients : []}
                portalsByClient={portalsByClient}
                isLoading={isLoading}
                onRowClick={(client: ClientResponseDto) => router.push(`/client/${client.id}`)}
                onEdit={(client: ClientResponseDto) => router.push(`/client/${client.id}/edit`)}
            />
        </div>
    );
}
