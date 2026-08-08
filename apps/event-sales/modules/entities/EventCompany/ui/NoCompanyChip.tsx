'use client';

import { FC } from 'react';
import { Building2 } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getClientContext } from '@/modules/app/lib/utills/app-state-util';

/**
 * Чип «компания не привязана» — виден только в контексте сделки без
 * компании. Живёт в ClientBar, поэтому появляется сразу во всех трёх
 * шапках (список, отчёт, полноэкранная карточка) — ровно там, где у
 * обычного клиента стоят прогноз и статус.
 *
 * Действия (записать ИНН, привязать компанию) добавляет фича Inn.
 */
export const NoCompanyChip: FC = () => {
    const context = useAppSelector(getClientContext);

    if (context !== 'dealNoCompany') return null;

    return (
        <ToneBadge tone="warning" variant="soft">
            <Building2 aria-hidden />
            Компания не привязана
        </ToneBadge>
    );
};
