'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateSmartDto, UpdateSmartDto } from '@workspace/nest-api';
import { usePortals } from '@/modules/entities/portal';
import { getSmartFormFields } from '../utils/btx-smart-form-fields';

type UseSmartFormParams = {
    portalId?: number;
    initialData?: UpdateSmartDto;
};

export const useSmartForm = ({ portalId, initialData }: UseSmartFormParams) => {
    const resolvedPortalId = portalId ?? initialData?.portal_id;
    const { data: portals } = usePortals();

    const form = useForm<CreateSmartDto>({
        defaultValues: {
            name: initialData?.name || '',
            title: initialData?.title || '',
            type: initialData?.type || '',
            group: initialData?.group || '',
            entityTypeId: initialData?.entityTypeId ?? 0,
            portal_id: resolvedPortalId ?? 0,
        },
    });

    const portalOptions = React.useMemo(
        () =>
            (Array.isArray(portals) ? portals : []).map((portal) => ({
                value: String(portal.id),
                label: portal.domain || `Portal #${portal.id}`,
            })),
        [portals]
    );

    const fields = React.useMemo(
        () => getSmartFormFields({ resolvedPortalId, portalOptions }),
        [portalOptions, resolvedPortalId]
    );

    return {
        ...form,
        fields,
        resolvedPortalId,
    };
};
