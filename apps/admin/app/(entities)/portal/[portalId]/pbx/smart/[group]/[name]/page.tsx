'use client';

import { useParams } from 'next/navigation';
import { PbxProcessDetail } from '@/modules/entities/pbx/process';
import {
    smartProcessAdapter,
    smartFieldsAdapter,
    smartCategoriesAdapter,
} from '@/modules/entities/pbx/smart';

export default function PbxSmartDetailPage() {
    const params = useParams<{ portalId: string; group: string; name: string }>();
    const portalId = Number(params.portalId);
    const group = params.group;
    const name = params.name;

    const label =
        smartProcessAdapter.variantOptions.find((o) => o.value === name)?.label ?? name;

    return (
        <PbxProcessDetail
            portalId={portalId}
            group={group}
            variant={name}
            label={label}
            backHref={`/portal/${portalId}/pbx/smart`}
            processAdapter={smartProcessAdapter}
            fieldsAdapter={smartFieldsAdapter}
            categoriesAdapter={smartCategoriesAdapter}
        />
    );
}
