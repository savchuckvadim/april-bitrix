'use client';

import { useParams } from 'next/navigation';
import { CabinetPanel } from '@/modules/entities/portal/cabinet';

/**
 * Кабинет клиента-портала: организация, участники и владелец, ссылки на
 * пароль, Telegram (бэк — @lib/cabinet, admin/cabinet/portals/:portalId).
 */
export default function PortalCabinetPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return <CabinetPanel portalId={portalId} />;
}
