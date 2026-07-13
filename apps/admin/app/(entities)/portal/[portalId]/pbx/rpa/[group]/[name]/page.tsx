'use client';

import { useParams } from 'next/navigation';
import { PbxProcessDetail } from '@/modules/entities/pbx/process';
import {
    rpaProcessAdapter,
    rpaFieldsAdapter,
    rpaCategoriesAdapter,
} from '@/modules/entities/pbx/rpa';

export default function PbxRpaDetailPage() {
    const params = useParams<{ portalId: string; group: string; name: string }>();
    const portalId = Number(params.portalId);
    const group = params.group;
    const name = params.name;

    const label =
        rpaProcessAdapter.variantOptions.find((o) => o.value === name)?.label ?? name;

    return (
        <PbxProcessDetail
            portalId={portalId}
            group={group}
            variant={name}
            label={label}
            backHref={`/portal/${portalId}/pbx/rpa`}
            processAdapter={rpaProcessAdapter}
            fieldsAdapter={rpaFieldsAdapter}
            categoriesAdapter={rpaCategoriesAdapter}
        />
    );
}
