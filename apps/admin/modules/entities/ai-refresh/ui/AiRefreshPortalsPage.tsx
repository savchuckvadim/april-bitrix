'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { describeLaunchError } from '@/modules/entities/ai-analytics-launch/lib/launch-error';
import { usePortals } from '@/modules/entities/portal/hooks';
import { AI_REFRESH_TEXT as TEXT } from '../consts/ai-refresh.const';
import {
    useAiRefreshPortals,
    useStartAiRefreshAll,
} from '../lib/hooks/use-ai-refresh';
import { AiRefreshControls } from './AiRefreshControls';
import { AiRefreshSteps } from './AiRefreshSteps';

/**
 * «Обновить всё: порталы» — одна страница вместо обхода порталов: кнопка
 * на всех порталах с AI-аналитикой и ход сценария каждого, со ссылкой на
 * страницу AI портала.
 */
export const AiRefreshPortalsPage = () => {
    const portals = useAiRefreshPortals();
    const startAll = useStartAiRefreshAll();
    const directory = usePortals();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const idOf = useMemo(
        () =>
            new Map(
                (directory.data ?? []).map(portal => [portal.domain, portal.id]),
            ),
        [directory.data],
    );
    const items = portals.data?.portals ?? [];

    return (
        <div className="space-y-6">
            <SectionCard
                title={TEXT.portals.title}
                description={TEXT.portals.description}
            >
                <div className="space-y-2">
                    <AiRefreshControls
                        title={TEXT.portals.startAll}
                        disabled={startAll.isPending || items.length === 0}
                        onStart={input => {
                            setError(null);
                            startAll.mutate(input, {
                                onSuccess: result =>
                                    setMessage(
                                        TEXT.portals.startedAll(
                                            result.results.filter(
                                                item => item.started,
                                            ).length,
                                        ),
                                    ),
                                onError: cause =>
                                    setError(describeLaunchError(cause)),
                            });
                        }}
                    />
                    {message && <p className="text-sm">{message}</p>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
            </SectionCard>
            {portals.isSuccess && items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    {TEXT.portals.empty}
                </p>
            )}
            {items.map(item => {
                const id = idOf.get(item.domain);
                return (
                    <SectionCard
                        key={item.domain}
                        title={item.domain}
                        actions={
                            id ? (
                                <Link
                                    className="text-sm text-primary underline-offset-2 hover:underline"
                                    href={`/portal/${id}/ai-settings`}
                                >
                                    {TEXT.portals.open}
                                </Link>
                            ) : undefined
                        }
                    >
                        {item.scenario ? (
                            <AiRefreshSteps scenario={item.scenario} compact />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {TEXT.notStarted}
                            </p>
                        )}
                    </SectionCard>
                );
            })}
        </div>
    );
};
