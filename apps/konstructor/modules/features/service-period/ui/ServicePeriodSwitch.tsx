'use client';

import { ChoiceChips } from '@workspace/april-ui/fields';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import type { ServicePeriodMode } from '@/modules/entities/service-offer';
import { useServicePeriod } from '../hooks/use-service-period';

/**
 * «Текущий период» / «Следующий период» (легаси ServiceOfferAnswer):
 * сервисный отдел ведёт на сделке перезаключения две сборки.
 */
export const ServicePeriodSwitch = () => {
    const period = useServicePeriod();

    if (!period.visible) return null;

    return (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
                Период
                {period.isSwitching ? <MicroSpinner size={12} /> : null}
            </span>
            <ChoiceChips
                ariaLabel="Период предложения"
                value={period.mode}
                options={period.options}
                onChange={value => period.setMode(value as ServicePeriodMode)}
            />
            {period.isSmartNew ? (
                <span className="text-warning">Следующий период начнётся с текущей сборки — сохраните её</span>
            ) : null}
            {period.error ? <span className="text-destructive">{period.error}</span> : null}
        </label>
    );
};
