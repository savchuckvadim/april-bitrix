'use client';

import { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { PreloaderMicro } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { CLIENT_WORK_TEXT } from '../../lib/client-work-text';
import { useClientWork } from '../../lib/hooks/use-client-work';
import { ClientWorkDealRow } from '../ClientWorkDealRow/ClientWorkDealRow';
import { ClientWorkJoinBar } from '../ClientWorkJoinBar/ClientWorkJoinBar';
import { ClientWorkNotes } from '../ClientWorkNotes/ClientWorkNotes';

/**
 * «Открытые сделки по клиенту» — все открытые сделки клиента в воронке продаж.
 *
 * «Возможные пересечения» сделки той же компании не показывают (это
 * окружение клиента, а не дубль), поэтому дубли одной компании видны и
 * присоединяются здесь: руководитель выбирает основную и отмечает, что
 * присоединить. Права проверяет сервер; остальным — только список.
 */
export const ClientWorkPanel: FC = () => {
    const view = useClientWork();
    if (!view.visible) return null;

    return (
        <SectionCard
            title={CLIENT_WORK_TEXT.title}
            description={view.clientTitle ?? undefined}
            tone="warning"
            accent
            density="compact"
            collapsible
            defaultOpen
            actions={
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={CLIENT_WORK_TEXT.refresh}
                    className="cursor-pointer"
                    disabled={view.isRefreshing}
                    onClick={view.refresh}
                >
                    <RefreshCw className="size-4" />
                </Button>
            }
        >
            {view.isRefreshing && (
                <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                    <PreloaderMicro />
                    {CLIENT_WORK_TEXT.loading}
                </div>
            )}

            {view.isError && (
                <p className="text-xs text-destructive">
                    {view.error ?? CLIENT_WORK_TEXT.loadError}
                </p>
            )}

            <div className="space-y-2">
                <ClientWorkNotes view={view} />
                <ul className="space-y-1.5">
                    {view.deals.map(deal => (
                        <li key={deal.id}>
                            <ClientWorkDealRow deal={deal} view={view} />
                        </li>
                    ))}
                </ul>
                {view.showJoinBar && <ClientWorkJoinBar view={view} />}
            </div>
        </SectionCard>
    );
};
