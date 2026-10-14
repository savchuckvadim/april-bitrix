'use client';

import { ToneBadge } from '@workspace/april-ui';
import { Spinner } from '@workspace/april-ui/feedback';
import type { DigestStatus } from '@/modules/entities/digest';
import { formatGeneratedAt } from '../lib/toolbar.util';

interface DigestStatusBadgeProps {
    status: DigestStatus;
    generatedAt?: string;
}

/** Состояние сборки: очередь / момент обновления / ошибка. */
export const DigestStatusBadge = ({ status, generatedAt }: DigestStatusBadgeProps) => {
    if (status === 'queued' || status === 'loading') {
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
    return updated ? (
        <ToneBadge tone="muted" variant="soft" size="sm">
            {updated}
        </ToneBadge>
    ) : null;
};
