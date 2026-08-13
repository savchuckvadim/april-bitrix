'use client';

import { FC } from 'react';
import { Building2 } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getClientContext } from '@/modules/app/lib/utills/app-state-util';

/**
 * Есть ли у клиента компания — прямым текстом.
 *
 * Раньше чип показывался ТОЛЬКО в сделке без компании, и в лиде экран об этом
 * молчал: менеджер узнавал о проблеме в момент, когда продажа не отправлялась.
 * Теперь говорим всегда, когда компании нет, но разным тоном: в сделке это
 * помеха работе (warning), в лиде — обычное положение дел (нейтрально).
 *
 * Живёт в ClientBar, поэтому появляется сразу во всех трёх шапках — ровно
 * там, где у обычного клиента стоят прогноз и статус. Действия (записать ИНН,
 * привязать компанию) добавляет фича Inn.
 */
export const NoCompanyChip: FC = () => {
    const context = useAppSelector(getClientContext);
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));

    if (hasCompany) return null;
    if (context !== 'dealNoCompany' && context !== 'lead') return null;

    const isDeal = context === 'dealNoCompany';

    return (
        <ToneBadge tone={isDeal ? 'warning' : 'muted'} variant="soft">
            <Building2 aria-hidden />
            {isDeal ? 'Компания не привязана' : 'Компании ещё нет'}
        </ToneBadge>
    );
};
