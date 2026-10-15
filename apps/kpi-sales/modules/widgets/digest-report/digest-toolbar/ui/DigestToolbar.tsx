'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { DigestStatus } from '@/modules/entities/digest';
import { DigestDayNav } from '@/modules/feature/digest-day-nav';
import { DigestStatusBadge } from './DigestStatusBadge';
import { DigestWarnings } from './DigestWarnings';

interface DigestToolbarProps {
    status: DigestStatus;
    /** Данные уже на экране — обновление идёт тихо, без прелоадера. */
    hasData: boolean;
    generatedAt?: string;
    /** Сегодняшний день обновляется автоматически. */
    autoRefresh: boolean;
    warnings: string[];
    truncated: boolean;
    onRefresh: () => void;
}

/** Шапка дайджеста: день, состояние сборки, пересчёт, предупреждения. */
export const DigestToolbar = ({
    status,
    hasData,
    generatedAt,
    autoRefresh,
    warnings,
    truncated,
    onRefresh,
}: DigestToolbarProps) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <DigestDayNav />
            <div className="flex items-center gap-2">
                <DigestStatusBadge
                    status={status}
                    hasData={hasData}
                    generatedAt={generatedAt}
                    autoRefresh={autoRefresh}
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={status === 'loading' || status === 'queued'}
                    onClick={onRefresh}
                >
                    <RefreshCw className="h-3 w-3" />
                    Пересчитать
                </Button>
            </div>
        </div>
        <DigestWarnings warnings={warnings} truncated={truncated} />
    </div>
);
