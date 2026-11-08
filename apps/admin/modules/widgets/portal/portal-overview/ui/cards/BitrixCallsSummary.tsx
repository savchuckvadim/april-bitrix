'use client';

import { usePortalBitrixLoad } from '@/modules/entities/portal/bitrix-load';
import { LOAD_WINDOW_HOURS, OVERVIEW_TEXT } from '../../consts/overview.const';
import {
    CALL_CLASS_TITLE,
    failureShare,
    formatCount,
    formatPeakHour,
    formatSeconds,
} from '../../lib/live-view';
import { OverviewTile } from '../OverviewTile';

const TOP_METHODS = 5;
/** Доля неудачных вызовов, с которой стоит разбираться, %. */
const FAILURE_ALERT_PERCENT = 2;

/**
 * Обращения April к REST портала за окно — по метрикам Prometheus
 * (`bitrix_requests_total` и соседи): сколько, сколько неудачных, как
 * долго, когда пик, кто грузит (люди или фон), где упёрлись в ограничитель.
 */
export const BitrixCallsSummary = ({ portalId }: { portalId: number }) => {
    const { data, isLoading, isError } = usePortalBitrixLoad(portalId, LOAD_WINDOW_HOURS);

    if (isLoading) return <p className="text-sm text-muted-foreground">{OVERVIEW_TEXT.loading}</p>;
    if (isError || !data) return <p className="text-sm text-destructive">Метрики вызовов не загрузились</p>;
    if (!data.available) {
        return <p className="text-sm text-muted-foreground">Метрик вызовов нет: {data.reason ?? 'причина не указана'}</p>;
    }

    const share = failureShare(data);
    const failed = data.errors + data.timeouts;
    const methods = data.topMethods.slice(0, TOP_METHODS);
    const { passed, rejected } = data.rateLimit;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <OverviewTile label="Вызовов Битрикса" value={formatCount(data.total)} />
                <OverviewTile
                    label="Неудачных"
                    value={formatCount(failed)}
                    hint={share === null ? undefined : `${String(share).replace('.', ',')} %, таймаутов ${data.timeouts}`}
                    tone={share !== null && share >= FAILURE_ALERT_PERCENT ? 'destructive' : failed ? 'warning' : 'success'}
                />
                <OverviewTile label="95 % быстрее" value={formatSeconds(data.p95Seconds)} hint="длительность вызова" />
                <OverviewTile
                    label="Час пика"
                    value={data.peakHour ? formatPeakHour(data.peakHour.at) : '—'}
                    hint={data.peakHour ? `${formatCount(data.peakHour.calls)} вызовов` : undefined}
                />
            </div>
            {data.byClass.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {data.byClass
                        .map(item => `${CALL_CLASS_TITLE[item.callClass] ?? item.callClass}: ${formatCount(item.calls)}`)
                        .join(' · ')}
                </p>
            )}
            {(passed > 0 || rejected > 0) && (
                <p className={rejected > 0 ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
                    Ограничитель частоты: без очереди прошло {formatCount(passed)}, фоновым отказано {formatCount(rejected)}.
                </p>
            )}
            {methods.length > 0 && (
                <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">Чаще всего вызывали</p>
                    {methods.map(item => (
                        <p key={item.method} className="flex justify-between gap-2 text-xs">
                            <span className="truncate font-mono">{item.method}</span>
                            <span className="text-muted-foreground">{formatCount(item.calls)}</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};
