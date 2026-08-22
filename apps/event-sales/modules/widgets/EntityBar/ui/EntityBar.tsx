'use client';

import { FC } from 'react';
import { ClientBar } from '@/modules/entities/EventCompany';
import { PresentationCountBadge } from '@/modules/entities/EVHistory/ui/PresentationCountBadge';
import { RelationsBar } from '@/modules/entities/RelatedCrm';
import { InnControl } from '@/modules/features/Inn';
import { SignalsControl } from '@/modules/features/ClientSignals';
import { useUiDensity } from '@/modules/app/lib/hooks/use-ui-density';

/**
 * Клиентская строка шапки: слева кто клиент (прогноз, статус, ИНН), справа —
 * куда движется (основная воронка с подписью + точки связи). Один компонент
 * на все экраны — раньше каждый экран собирал свою копию, и при переключениях
 * они расходились и в наборе, и в геометрии.
 */
export const EntityBar: FC = () => {
    const { isTight: isCompact } = useUiDensity();
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <ClientBar compact={isCompact} className="min-w-50" />
                <PresentationCountBadge />
                <InnControl compact={isCompact} />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-x-3">
                <RelationsBar
                    compact={isCompact}
                    mode='baseOnly'
                    className="min-w-0 flex-1"
                />
                <SignalsControl compact={isCompact} />
            </div>
        </div>
    );
};
