'use client';

import { BxRqPage } from '@/modules/pages';
import { Screen, ScreenHeader } from '@/modules/shared';

/** Реквизиты клиента (бывший /bitrix/bx-rq). */
export default function RequisitesPage() {
    return (
        <Screen>
            <ScreenHeader
                title="Реквизиты"
                description="Реквизиты клиента для договора и счёта."
            />
            <BxRqPage />
        </Screen>
    );
}
