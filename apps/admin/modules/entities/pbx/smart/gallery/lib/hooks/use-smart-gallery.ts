'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TypedGroup } from '../../../../lib/model/common';
import { usePortalDbSmarts } from '../../../db/lib/hooks';
import { SmartProcessHelper } from '../../../process/lib/api/smart-process-helper';
import { buildSmartGalleryCards } from '../build-gallery-cards';
import { useConstSmartRegistry } from '../../../db/lib/hooks/use-const-smart-registry';

const processHelper = new SmartProcessHelper();

/**
 * Композиция данных галереи: смарты портала (PortalDB) + реестр const-смартов
 * + мониторинг pbx-install. Ключ мониторинга строго `['pbx-process','smart',
 * domain]` — тот же, что у `usePbxProcess` в аккордеоне «Установка по
 * эталону», поэтому кэш общий и запрос не дублируется.
 */
export function useSmartGallery(
    portalId: number,
    domain: string | undefined,
    templateGroup: TypedGroup,
) {
    const smarts = usePortalDbSmarts(portalId);
    const registry = useConstSmartRegistry();
    const monitoring = useQuery({
        queryKey: ['pbx-process', 'smart', domain],
        queryFn: () => processHelper.getSmarts(domain as string),
        enabled: !!domain,
    });

    const cards = React.useMemo(
        () =>
            buildSmartGalleryCards({
                dbSmarts: smarts.data ?? [],
                registry: registry.data?.items ?? [],
                monitoring: monitoring.data,
                templateGroup,
            }),
        [smarts.data, registry.data, monitoring.data, templateGroup],
    );

    return { smarts, registry, monitoring, cards };
}
