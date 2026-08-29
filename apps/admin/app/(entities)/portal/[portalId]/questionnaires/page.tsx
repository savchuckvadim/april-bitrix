'use client';

import { useParams } from 'next/navigation';
import { PortalQuestionnairesPanel } from '@/modules/entities/portal/questionnaires';

/**
 * Каталог анкет портала: наборы вопросов, которые менеджер видит в карточке
 * звонка. Состав, условия показа и привязки к полям CRM живут на бэке —
 * страница только достаёт id портала из адреса.
 */
export default function PortalQuestionnairesPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return <PortalQuestionnairesPanel portalId={portalId} />;
}
