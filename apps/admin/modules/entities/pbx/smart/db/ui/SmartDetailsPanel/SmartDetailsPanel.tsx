'use client';

import type { SmartResponseDto } from '@workspace/nest-admin-api';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { DetailLine } from '../../../../lib/ui';
import { getApiErrorMessage } from '../../../../lib/api-error';
import { useSmartDetails } from '../../lib/hooks';
import { SmartBitrixDetails } from './components/SmartBitrixDetails';

/** null/undefined и orval-заглушки `{[k]: unknown}` → строка или «—». */
function show(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
}

/** Строка `smarts` из PortalDB — видна и когда Bitrix недоступен. */
function DbSmartCard({
    smart,
    domain,
}: {
    smart: SmartResponseDto;
    domain: string;
}) {
    return (
        <div className="space-y-1 rounded-md border p-3">
            <p className="font-semibold">Строка `smarts` (PortalDB)</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-3">
                <DetailLine label="id" value={smart.id} />
                <DetailLine label="type" value={smart.type} />
                <DetailLine label="group" value={smart.group} />
                <DetailLine label="name" value={smart.name} />
                <DetailLine label="title" value={smart.title} />
                <DetailLine label="entityTypeId" value={smart.entityTypeId} />
                <DetailLine label="bitrixId" value={show(smart.bitrixId)} />
                <DetailLine label="forStage" value={show(smart.forStage)} />
                <DetailLine label="forFilter" value={show(smart.forFilter)} />
                <DetailLine label="crm" value={show(smart.crm)} />
                <DetailLine label="domain" value={domain} />
                <DetailLine label="updated_at" value={show(smart.updated_at)} />
            </div>
        </div>
    );
}

/**
 * Раскрывающаяся панель деталей смарта: живое состояние в Bitrix (поля с
 * enum-значениями, воронки со стадиями) + строка БД. Данные грузятся лениво
 * при первом раскрытии строки и кэшируются TanStack Query по id смарта.
 * При `bitrix=null` показывается блок ошибки и данные строки `smarts`.
 */
export function SmartDetailsPanel({ smartId }: { smartId: number }) {
    const details = useSmartDetails(smartId);

    if (details.isPending) {
        return (
            <p className="p-3 text-sm text-muted-foreground">
                Загрузка деталей смарта…
            </p>
        );
    }

    if (details.isError) {
        return (
            <div className="space-y-2 p-3">
                <p className="text-sm text-destructive">
                    {getApiErrorMessage(
                        details.error,
                        'Не удалось загрузить детали смарта',
                    )}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void details.refetch()}
                >
                    Повторить
                </Button>
            </div>
        );
    }

    const data = details.data;
    return (
        <div className="space-y-4 p-3 text-xs">
            {data.bitrix ? (
                <SmartBitrixDetails bitrix={data.bitrix} />
            ) : (
                <Alert variant="destructive">
                    <AlertTitle>Живое состояние Bitrix недоступно</AlertTitle>
                    <AlertDescription>
                        {data.error ??
                            'Портал не ответил — показаны только данные из PortalDB.'}
                    </AlertDescription>
                </Alert>
            )}
            <DbSmartCard smart={data.smart} domain={data.domain} />
        </div>
    );
}
