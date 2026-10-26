'use client';

// глубокий импорт: баррель pages тянет замороженный /offer (Google-шрифты) во все маршруты
import { BxRqPage } from '@/modules/pages/bx-rq/BxRqPage';
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
