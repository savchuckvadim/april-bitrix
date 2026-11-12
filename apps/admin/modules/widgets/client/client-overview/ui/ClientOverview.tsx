'use client';

import Link from 'next/link';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { useClientOverview } from '@/modules/entities/client';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { GuideChecklist } from '@/modules/shared/ui/guide';
import { clientChecklist } from '../lib/client-checklist';
import { ClientPeopleCard } from './ClientPeopleCard';
import { ClientPortalsCard } from './ClientPortalsCard';

const CABINET_GUIDE = '/marketplace/cabinet-guide';

/**
 * Страница клиента (организации): кто это, что осталось сделать, его
 * порталы с владельцами и люди с доступами. Удаления здесь нет: в БД у
 * порталов клиента каскадное удаление — организацию с порталами бэк и так
 * не удалит.
 */
export const ClientOverview = ({ clientId }: { clientId: number }) => {
    const { data, isLoading, isError, error } = useClientOverview(clientId);

    if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
    if (isError || !data) {
        return <HookNotice tone="error" title="Клиент не загрузился" message={getApiErrorMessage(error)} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold">{data.name}</h1>
                        <span className="text-sm text-muted-foreground">#{data.clientId}</span>
                        <ToneBadge tone={data.isActive ? 'success' : 'muted'} size="sm">
                            {data.isActive ? 'действует' : 'отключён'}
                        </ToneBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.email ?? 'email не указан'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/client/${data.clientId}/edit`}>Изменить</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href={CABINET_GUIDE}>Путеводитель</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                        <Link href="/client">Все клиенты</Link>
                    </Button>
                </div>
            </div>

            <GuideChecklist
                checks={clientChecklist(data)}
                title="Что сделать"
                description="Чтобы клиент пользовался кабинетом и получал отчёты."
                summaryLabel={(done, total) => `готово ${done} из ${total}`}
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <ClientPortalsCard clientId={data.clientId} portals={data.portals} />
                <ClientPeopleCard people={data.people} />
            </div>
        </div>
    );
};
