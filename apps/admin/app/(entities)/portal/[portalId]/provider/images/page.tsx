'use client';

import { useParams } from 'next/navigation';
import { PROVIDER_IMAGES_PANEL_TEXT, ProviderImagesPanel } from '@/modules/widgets/portal/provider-images';

/**
 * «Печати, подписи и логотипы» портала: картинки всех реквизитов его
 * поставщиков и перенос из легаси. Страница только берёт id портала из адреса.
 */
export default function PortalProviderImagesPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {PROVIDER_IMAGES_PANEL_TEXT.invalidPortal}
            </p>
        );
    }

    return <ProviderImagesPanel portalId={portalId} />;
}
