'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { useSmartDetails } from '../../lib/hooks';
import { SmartDetailsPanel } from '../SmartDetailsPanel';

/**
 * Полная страница смарта из PortalDB по `smarts.id`: заголовок с реальным
 * title/type/group + `SmartDetailsPanel` (живое состояние Bitrix + строка БД).
 * Сюда ведут «Открыть» из таблицы и галереи для const/manual-смартов —
 * шаблонная страница `[group]/[name]` для них не подходит (у неё эталонные
 * поля/стадии, которых у const-смартов нет, а `name` — русский title,
 * уродующий URL перекодированной кириллицей).
 *
 * Заголовок читает тот же запрос TanStack Query, что и панель
 * (ключ `details/{smartId}`) — данные грузятся один раз.
 */
export function DbSmartDetailScreen({
    portalId,
    smartId,
}: {
    portalId: number;
    smartId: number;
}) {
    const details = useSmartDetails(smartId);
    const smart = details.data?.smart;

    return (
        <div className="space-y-4">
            <Button size="sm" variant="ghost" asChild>
                <Link href={`/portal/${portalId}/pbx/smart`}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Назад к списку
                </Link>
            </Button>

            <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                    {smart?.title ?? `Смарт #${smartId}`}
                </h2>
                {smart && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-xs">
                            {smart.type}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                            {smart.group}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                            entityTypeId {smart.entityTypeId}
                        </Badge>
                        {details.data?.domain && (
                            <span className="text-xs text-muted-foreground">
                                Портал: {details.data.domain}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="rounded-md border">
                <SmartDetailsPanel smartId={smartId} />
            </div>
        </div>
    );
}
