'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { usePortalAiProvidersReadiness } from '../../../lib/hooks';
import {
    AI_TRANSCRIPTION_MODE_OPTIONS,
    type AiProviderReadiness,
    type PortalAiProvidersReadiness,
} from '../../../model';

const sourceLabel = (source: AiProviderReadiness['source']): string | null =>
    source === 'portal'
        ? 'ключ портала'
        : source === 'env'
          ? 'настройка приложения'
          : null;

/** Цвет точки: зелёная — настроен и в работе; красная — в работе, но не настроен. */
const dotClass = (entry: AiProviderReadiness): string => {
    if (entry.configured) {
        return entry.inUse ? 'bg-emerald-500' : 'bg-muted-foreground/40';
    }
    return entry.inUse ? 'bg-destructive' : 'bg-amber-400';
};

function ReadinessRow({ entry }: { entry: AiProviderReadiness }) {
    const source = sourceLabel(entry.source);
    return (
        <li className="flex items-start gap-2 text-sm">
            <span
                aria-hidden
                className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(entry)}`}
            />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={entry.inUse ? '' : 'text-muted-foreground'}>
                        {entry.title}
                    </span>
                    {!entry.inUse && (
                        <Badge variant="outline">не используется</Badge>
                    )}
                    {source && <Badge variant="secondary">{source}</Badge>}
                    {entry.viaProxy && <Badge variant="outline">через прокси</Badge>}
                    {entry.endpointHost && (
                        <span className="text-xs text-muted-foreground">
                            {entry.endpointHost}
                        </span>
                    )}
                </div>
                {entry.issue && (
                    <p className="text-xs text-destructive">{entry.issue}</p>
                )}
                {entry.probe && (
                    <p
                        className={`text-xs ${entry.probe.ok ? 'text-emerald-600' : 'text-destructive'}`}
                    >
                        Проверка связи: {entry.probe.message} ({entry.probe.durationMs} мс)
                    </p>
                )}
            </div>
        </li>
    );
}

const modeLabel = (mode: string): string =>
    AI_TRANSCRIPTION_MODE_OPTIONS.find((option) => option.value === mode)
        ?.label ?? mode;

const sourceSuffix = (source: PortalAiProvidersReadiness['llmOrderSource']) =>
    source === 'portal' ? 'настройка портала' : 'настройка приложения';

function ProxyLine({
    proxy,
}: {
    proxy: PortalAiProvidersReadiness['egressProxy'];
}) {
    if (!proxy.enabled) {
        return (
            <p className="text-xs text-muted-foreground">
                Прокси за рубеж не настроен: зарубежные сервисы (OpenAI, Groq,
                Telegram) с сервера в РФ напрямую не ответят — нужен EGRESS_PROXY_*
                в окружении приложения (попросите разработчика).
            </p>
        );
    }
    return (
        <p className="text-xs text-muted-foreground">
            Прокси за рубеж включён ({proxy.proxyHost ?? 'адрес скрыт'}); через
            него идут: {proxy.hosts.join(', ') || '—'}.
        </p>
    );
}

/**
 * «Что настроено сейчас»: чек-лист провайдеров портала с сервера — действующий
 * порядок LLM и транскрибаторы, чей ключ, через прокси ли, причины «не
 * сработает». Кнопка «Проверить связь» дополнительно опрашивает endpoint'ы.
 * Показывает сохранённое состояние, а не черновик формы.
 */
export function ProvidersReadiness({ portalId }: { portalId: number }) {
    const [probe, setProbe] = React.useState(false);
    const readiness = usePortalAiProvidersReadiness(portalId, probe);
    const check = () => {
        if (probe) void readiness.refetch();
        else setProbe(true);
    };

    return (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium">
                    Что настроено сейчас (сохранённое состояние)
                </h4>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={check}
                    disabled={readiness.isFetching}
                >
                    {readiness.isFetching ? 'Проверяю…' : 'Проверить связь'}
                </Button>
            </div>

            {readiness.isError && (
                <p className="text-sm text-destructive">
                    Не удалось получить чек-лист провайдеров — попробуйте позже.
                </p>
            )}
            {readiness.isLoading && (
                <p className="text-sm text-muted-foreground">Загрузка…</p>
            )}

            {readiness.data && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Разборы (LLM) — {sourceSuffix(readiness.data.llmOrderSource)}
                        </p>
                        <ul className="space-y-1.5">
                            {readiness.data.llmOrder.map((entry) => (
                                <ReadinessRow key={entry.code} entry={entry} />
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Транскрибация: {modeLabel(readiness.data.transcriptionMode)} —{' '}
                            {sourceSuffix(readiness.data.transcriptionModeSource)}
                        </p>
                        <ul className="space-y-1.5">
                            {readiness.data.transcription.map((entry) => (
                                <ReadinessRow key={entry.code} entry={entry} />
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <ProxyLine proxy={readiness.data.egressProxy} />
                        <p className="text-xs text-muted-foreground/80">
                            Проверено:{' '}
                            {new Date(readiness.data.checkedAt).toLocaleString('ru-RU')}
                            {probe ? ' · с проверкой связи' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
