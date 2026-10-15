'use client';

import { ToneBadge } from '@workspace/april-ui';
import { Spinner } from '@workspace/april-ui/feedback';
import type { DigestStatus } from '@/modules/entities/digest';
import { formatGeneratedAt } from '../lib/toolbar.util';

interface DigestStatusBadgeProps {
    status: DigestStatus;
    hasData: boolean;
    generatedAt?: string;
    autoRefresh: boolean;
}

/**
 * Состояние сборки: очередь / момент обновления / ошибка. Когда данные уже
 * на экране, пересчёт показывается тихой подписью без спиннера.
 */
export const DigestStatusBadge = ({
    status,
    hasData,
    generatedAt,
    autoRefresh,
}: DigestStatusBadgeProps) => {
    const busy = status === 'queued' || status === 'loading';
    if (busy && !hasData) {
        return (
            <ToneBadge tone="info" variant="soft" size="sm">
                <Spinner size="sm" />
                {status === 'queued' ? 'Считаем день…' : 'Загрузка…'}
            </ToneBadge>
        );
    }
    if (status === 'error') {
        return (
            <ToneBadge tone="destructive" variant="soft" size="sm">
                Ошибка расчёта
            </ToneBadge>
        );
    }
    const updated = formatGeneratedAt(generatedAt);
    if (busy) {
        return (
            <ToneBadge tone="muted" variant="soft" size="sm" title={updated ?? undefined}>
                обновляем…
            </ToneBadge>
        );
    }
    if (!updated) return null;
    return (
        <ToneBadge
            tone="muted"
            variant="soft"
            size="sm"
            title={autoRefresh ? 'Сегодняшний день обновляется автоматически каждые 5 минут' : undefined}
        >
            {updated}
            {autoRefresh && ' · авто 5 мин'}
        </ToneBadge>
    );
};
