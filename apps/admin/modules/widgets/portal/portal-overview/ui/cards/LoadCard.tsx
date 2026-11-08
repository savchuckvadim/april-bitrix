'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { useLogsSummary } from '@/modules/entities/logs';
import { grafanaLoadUrl, LOAD_WINDOW_HOURS } from '../../consts/overview.const';
import { isBitrixLimitError } from '../../lib/overview-view';
import { BitrixCallsSummary } from './BitrixCallsSummary';

const TOP_ERRORS = 5;

/**
 * Нагрузка и ошибки портала за сутки: вызовы Битрикса — по метрикам
 * Prometheus ({@link BitrixCallsSummary}); ошибки — по журналам приложений (ClickHouse):
 * ошибки и предупреждения по приложениям, частые ошибки, отдельно —
 * перегрузка Битрикса (QUERY_LIMIT_EXCEEDED и т.п.). Графики вызовов —
 * в Grafana («Нагрузка на Битрикс»), если задан её адрес.
 */
export const LoadCard = ({ portalId, domain }: { portalId: number; domain: string }) => {
    const { data, isLoading, isError } = useLogsSummary({ hours: LOAD_WINDOW_HOURS, domain });
    const apps = (data?.apps ?? []).filter(item => item.total > 0);
    const top = (data?.topErrors ?? []).slice(0, TOP_ERRORS);
    const limitHits = (data?.topErrors ?? [])
        .filter(item => isBitrixLimitError(item.sample))
        .reduce((sum, item) => sum + item.count, 0);
    const grafana = grafanaLoadUrl(domain);

    return (
        <SectionCard
            title={`Нагрузка и ошибки за ${LOAD_WINDOW_HOURS} ч`}
            description="Вызовы Битрикса — по метрикам, ошибки — по журналам приложений April."
            actions={
                limitHits > 0 ? (
                    <ToneBadge tone="destructive" size="sm">
                        Битрикс ограничивал: {limitHits}
                    </ToneBadge>
                ) : undefined
            }
        >
            <BitrixCallsSummary portalId={portalId} />
            <p className="mb-1 mt-4 border-t pt-3 text-xs font-medium text-muted-foreground">Журналы приложений</p>
            {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {isError && <p className="text-sm text-destructive">Журналы не загрузились</p>}
            {data && apps.length === 0 && (
                <p className="text-sm text-muted-foreground">Записей по порталу за сутки нет.</p>
            )}
            {apps.length > 0 && (
                <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                        <tr>
                            <th className="text-left font-normal">Приложение</th>
                            <th className="text-right font-normal">Ошибки</th>
                            <th className="text-right font-normal">Предупр.</th>
                            <th className="text-right font-normal">Всего</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(item => (
                            <tr key={item.app} className="border-t">
                                <td className="py-1">{item.app}</td>
                                <td className={item.errors ? 'text-right text-destructive' : 'text-right'}>{item.errors}</td>
                                <td className="text-right">{item.warnings}</td>
                                <td className="text-right text-muted-foreground">{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {top.length > 0 && (
                <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Частые ошибки</p>
                    {top.map(item => (
                        <p
                            key={`${item.app}:${item.sample}`}
                            className={isBitrixLimitError(item.sample) ? 'text-xs text-destructive' : 'text-xs'}
                        >
                            <b>{item.count}×</b> {item.app}: {item.sample.slice(0, 160)}
                        </p>
                    ))}
                </div>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <Link href="/logs" className="text-primary hover:underline">
                    Журналы приложений
                </Link>
                {grafana && (
                    <a href={grafana} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        Нагрузка на Битрикс в Grafana <ExternalLink className="size-3" />
                    </a>
                )}
            </div>
        </SectionCard>
    );
};
