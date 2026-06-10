'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateBtxDealDto, UpdateBtxDealDto } from '@workspace/nest-api';
import { usePortals } from '@/modules/entities/portal';
import { getBtxDealFormFields } from '../utils/btx-deal-form-fields';

type UseBtxDealFormParams = {
    portalId?: number;
    initialData?: UpdateBtxDealDto;
};

export const useBtxDealForm = ({ portalId, initialData }: UseBtxDealFormParams) => {
    const resolvedPortalId = portalId ?? initialData?.portal_id;
    const { data: portals } = usePortals();

    const form = useForm<CreateBtxDealDto>({
        defaultValues: {
            name: initialData?.name || '',
            title: initialData?.title || '',
            code: initialData?.code || '',
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
        () => getBtxDealFormFields({ resolvedPortalId, portalOptions }),
        [portalOptions, resolvedPortalId]
    );

    return {
        ...form,
        fields,
        resolvedPortalId,
    };
};

