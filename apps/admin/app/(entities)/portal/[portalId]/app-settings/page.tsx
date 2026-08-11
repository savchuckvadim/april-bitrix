'use client';

import { useParams } from 'next/navigation';
import { PortalAppSettingsPanel } from '@/modules/entities/portal/app-settings';

/**
 * Настройки placement-приложений портала: каждый параметр (в основном
 * фич-флаги) настраивается на портал отдельно; схема приходит с бэка.
 */
export default function PortalAppSettingsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return <PortalAppSettingsPanel portalId={portalId} />;
}
