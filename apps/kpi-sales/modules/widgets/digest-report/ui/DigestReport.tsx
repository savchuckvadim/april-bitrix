'use client';

import { Suspense } from 'react';
import { useDigestAutoRefresh } from '../hooks/use-digest-auto-refresh';
import { useDigestReport } from '../hooks/use-digest-report';
import { DigestToolbar } from '../digest-toolbar';
import { DigestBody } from './DigestBody';
import { DigestErrorState } from './DigestErrorState';
import { DigestSkeleton } from './DigestSkeleton';

/**
 * Вкладка «Дайджест»: день по сотрудникам — итоги и подвкладки (часы,
 * сотрудники, рейтинг, план дня, презентации, продажи, лента). Данные:
 * entities/digest (очередь + WS + поллинг), период — свой (день), сегодняшний
 * день тихо обновляется раз в 5 минут.
 */
export const DigestReport = () => {
    const digest = useDigestReport();
    const { autoRefreshEnabled } = useDigestAutoRefresh();

    return (
        <div className="space-y-4">
            <DigestToolbar
                status={digest.status}
                hasData={!!digest.data}
                generatedAt={digest.data?.generatedAt}
                autoRefresh={autoRefreshEnabled}
                warnings={digest.data?.warnings ?? []}
                truncated={!!digest.data?.truncated}
                onRefresh={digest.refresh}
            />
            {digest.isError && (
                <DigestErrorState message={digest.error} onRetry={digest.refresh} />
            )}
            {!digest.data && !digest.isError && (
                <DigestSkeleton queued={digest.isQueued} />
            )}
            {digest.data && (
                // Подвкладка живёт в URL (useSearchParams) — нужен Suspense.
                <Suspense fallback={<DigestSkeleton queued={false} />}>
                    <DigestBody report={digest.data} />
                </Suspense>
            )}
        </div>
    );
};
