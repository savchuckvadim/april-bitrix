'use client';

import { useParams } from 'next/navigation';
import { PortalAiSettingsPanel } from '@/modules/entities/portal/ai-settings';

export default function PortalAiSettingsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }
    return <PortalAiSettingsPanel portalId={portalId} />;
}
