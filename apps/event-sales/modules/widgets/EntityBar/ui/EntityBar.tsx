'use client';

import { FC } from 'react';
import { PresentationCountBadge } from '@/modules/entities/EVHistory/ui/PresentationCountBadge';
import { RelationsBar } from '@/modules/entities/RelatedCrm';
import { SignalsControl } from '@/modules/features/ClientSignals';
import { useUiDensity } from '@/modules/app/lib/hooks/use-ui-density';

/**
 * Клиентская строка шапки: куда движется клиент — основная воронка с
 * подписью, счётчик презентаций, точки связи.
 *
 * Прогноз/статус компании и ИНН отсюда ПЕРЕЕХАЛИ в первый ряд высокого
 * хедера, к названию сущности (todo2508 №6) — строка стала легче и видна
 * только на широких экранах (гейт в EntityHeader).
 */
export const EntityBar: FC = () => {
    const { isTight: isCompact } = useUiDensity();
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <PresentationCountBadge />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-x-3">
                <RelationsBar
                    compact={isCompact}
                    mode="baseOnly"
                    className="min-w-0 flex-1"
                />
                <SignalsControl compact={isCompact} />
            </div>
        </div>
    );
};
