'use client';

import { useDigestReport } from '../hooks/use-digest-report';
import { DigestToolbar } from '../digest-toolbar';
import { DigestBody } from './DigestBody';
import { DigestErrorState } from './DigestErrorState';
import { DigestSkeleton } from './DigestSkeleton';

/**
 * Вкладка «Дайджест»: день по сотрудникам — итоги, часы, таблица,
 * рейтинги, план дня, презентации одного сотрудника, лента с комментариями.
 * Данные: entities/digest (очередь + WS + поллинг), период — свой (день).
 */
export const DigestReport = () => {
    const digest = useDigestReport();

    return (
        <div className="space-y-4">
            <DigestToolbar
                status={digest.status}
                generatedAt={digest.data?.generatedAt}
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
            {digest.data && <DigestBody report={digest.data} />}
        </div>
    );
};
