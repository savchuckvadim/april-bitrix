'use client';

import { useMemo, useState } from 'react';
import { usePortal } from '@/modules/entities/portal';
import { useProvidersByDomain } from '@/modules/entities/portal-provider';
import { providerImageErrorMessage } from '@/modules/entities/portal-provider/provider-image';
import { PROVIDER_IMAGES_PANEL_TEXT } from '../consts/provider-images-panel.text';
import { buildProviderImageTargets } from '../lib/provider-image-targets.util';

export type ProviderImagesPanelStatus = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Данные страницы: поставщики портала по домену, их реквизиты для карточек и
 * состояние окна переноса из легаси. Картинки каждых реквизитов грузит и
 * правит своя секция карточки.
 */
export function useProviderImagesPanel(portalId: number) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const providers = useProvidersByDomain(domain);
    const [importOpen, setImportOpen] = useState(false);

    const targets = useMemo(() => buildProviderImageTargets(providers.data ?? []), [providers.data]);

    let status: ProviderImagesPanelStatus = 'ready';
    if (portal.isError || providers.isError) {
        status = 'error';
    } else if (portal.isLoading || !domain || providers.isLoading) {
        status = 'loading';
    } else if (targets.length === 0) {
        status = 'empty';
    }

    return {
        domain,
        targets,
        status,
        errorMessage: providerImageErrorMessage(
            providers.error ?? portal.error,
            PROVIDER_IMAGES_PANEL_TEXT.loadError,
        ),
        retry: () => void (portal.isError ? portal.refetch() : providers.refetch()),
        importOpen,
        setImportOpen,
    };
}
