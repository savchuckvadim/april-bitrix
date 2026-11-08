'use client';

import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui/badges';
import { useLivePlacementsCheck } from '@/modules/entities/marketplace/applications';
import { liveWidgetsView } from '../../lib/live-view';

interface LiveWidgetsCheckProps {
    portalId: number;
    /** Список виджетов портала (`app_widgets`). */
    desired: readonly string[];
    titles: Readonly<Record<string, string>>;
}

/**
 * «Проверить в Битриксе»: что на самом деле привязано сейчас (placement.get)
 * — в отличие от списка выше, который показывает последнюю синхронизацию.
 * По кнопке: это вызов к порталу клиента.
 */
export const LiveWidgetsCheck = ({ portalId, desired, titles }: LiveWidgetsCheckProps) => {
    const check = useLivePlacementsCheck();
    const live = check.data;
    const view = live?.ok ? liveWidgetsView(desired, live.bindings, titles) : null;

    return (
        <div className="mt-3 space-y-2 border-t pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Как видит Битрикс сейчас</span>
                <Button size="sm" variant="outline" disabled={check.isPending} onClick={() => check.mutate(portalId)}>
                    {check.isPending ? 'Проверяю…' : 'Проверить в Битриксе'}
                </Button>
            </div>
            {check.isError && <p className="text-xs text-destructive">Не проверилось: {check.error.message}</p>}
            {live && !live.ok && <p className="text-xs text-destructive">Битрикс не отдал привязки: {live.error}</p>}
            {view && (
                <ul className="space-y-1 text-xs">
                    {view.rows.map(row => (
                        <li key={row.code} className="flex flex-wrap items-center justify-between gap-2">
                            <span>{row.title}</span>
                            {row.places.length ? (
                                <span className="text-muted-foreground">{row.places.join(', ')}</span>
                            ) : (
                                <ToneBadge tone="warning" size="sm">
                                    не привязан
                                </ToneBadge>
                            )}
                        </li>
                    ))}
                    {view.extra.length > 0 && (
                        <li className="text-warning">
                            Лишние привязки April (нет в списке портала):{' '}
                            {view.extra.map(item => `${item.widget ?? '?'} → ${item.placement}`).join(', ')}
                        </li>
                    )}
                    {view.foreign.length > 0 && (
                        <li className="text-muted-foreground">
                            На другой адрес обработчика (старые привязки): {view.foreign.length} —{' '}
                            {view.foreign.map(item => item.placement).join(', ')}
                        </li>
                    )}
                    {view.rows.length === 0 && view.extra.length === 0 && view.foreign.length === 0 && (
                        <li className="text-muted-foreground">Привязок у приложения нет.</li>
                    )}
                </ul>
            )}
        </div>
    );
};
