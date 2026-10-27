'use client';

import { useParams } from 'next/navigation';
import { PortalBadgesPanel } from '@/modules/entities/portal/badges';

/**
 * Бейджики портала: готовые формулировки для комментария отчёта и названия
 * события в «Звонках». Режим и набор живут на бэке — страница только
 * достаёт id портала из адреса.
 */
export default function PortalBadgesPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return <PortalBadgesPanel portalId={portalId} />;
}
