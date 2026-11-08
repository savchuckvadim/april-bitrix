'use client';

import { ExternalLink } from 'lucide-react';
import { useSupportDialogStats } from '@/modules/entities/support';
import { OVERVIEW_TEXT, SUPPORT_STATS_DAYS } from '../../consts/overview.const';
import { formatMinutes } from '../../lib/overview-view';
import { OverviewTile } from '../OverviewTile';

const RECENT_SHOWN = 5;
/** Ожидание ответа, с которого это уже плохо, минут. */
const LONG_WAIT_MINUTES = 30;

const formatDate = (iso: string | null): string =>
    iso
        ? new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—';

/**
 * Статистика обращений портала в поддержку за период — по истории, которую
 * ведёт крон монитора линии. Пока миграция не применена — причина вместо цифр.
 */
export const SupportStats = ({ domain }: { domain: string }) => {
    const { data, isLoading, isError } = useSupportDialogStats(domain, SUPPORT_STATS_DAYS);

    if (isLoading) return <p className="text-sm text-muted-foreground">{OVERVIEW_TEXT.loading}</p>;
    if (isError || !data) return <p className="text-sm text-destructive">Статистика обращений не загрузилась</p>;
    if (!data.available) return <p className="text-sm text-muted-foreground">{data.reason}</p>;

    const recent = data.recent.slice(0, RECENT_SHOWN);
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <OverviewTile label={`Обращений за ${data.days} дн.`} value={String(data.total)} hint={`открыто ${data.open}`} />
                <OverviewTile
                    label="Без ответа"
                    value={String(data.closedUnanswered)}
                    hint="закрыты, никто не ответил"
                    tone={data.closedUnanswered ? 'warning' : 'muted'}
                />
                <OverviewTile
                    label="Ждали в среднем"
                    value={data.avgWaitMinutes === null ? '—' : formatMinutes(data.avgWaitMinutes)}
                />
                <OverviewTile
                    label="Дольше всего"
                    value={data.longestWaitMinutes ? formatMinutes(data.longestWaitMinutes) : '—'}
                    tone={data.longestWaitMinutes >= LONG_WAIT_MINUTES ? 'destructive' : 'muted'}
                />
            </div>
            {recent.length > 0 && (
                <ul className="space-y-1 text-xs">
                    {recent.map(item => (
                        <li key={`${item.lineDomain}:${item.sessionId}`} className="flex flex-wrap items-center justify-between gap-2">
                            <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                {formatDate(item.firstSeenAt)} · {item.clientName ?? 'клиент'} <ExternalLink className="size-3" />
                            </a>
                            <span className="text-muted-foreground">
                                {item.closedAt ? 'закрыт' : 'открыт'}
                                {item.answered ? '' : ', без ответа'}
                                {item.maxWaitedMinutes ? `, ждал ${formatMinutes(item.maxWaitedMinutes)}` : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">
                {data.trackedSince
                    ? `Учёт ведётся с ${formatDate(data.trackedSince)}; диалоги короче нескольких минут не видны.`
                    : 'Учёт включён, обращений ещё не было.'}
            </p>
        </div>
    );
};
