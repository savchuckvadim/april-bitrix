'use client';

import { useParams } from 'next/navigation';
import { PbxProcessDetail } from '@/modules/entities/pbx/process';
import {
    smartProcessAdapter,
    smartFieldsAdapter,
    smartCategoriesAdapter,
    useConstSmartRegistry,
} from '@/modules/entities/pbx/smart';

export default function PbxSmartDetailPage() {
    const params = useParams<{ portalId: string; group: string; name: string }>();
    const portalId = Number(params.portalId);
    // useParams отдаёт сегменты URL-кодированными — кириллица без decode
    // расползается по UI перекодированными %D0%…-последовательностями.
    const group = decodeURIComponent(params.group);
    const name = decodeURIComponent(params.name);

    // Const-смарты (aicall и будущие) открываются этой же страницей по
    // /smart/{group}/{type} — русский label берём из реестра.
    const registry = useConstSmartRegistry();
    const constLabel = registry.data?.items.find(
        (item) => item.type === name && item.group === group,
    )?.title;

    const label =
        smartProcessAdapter.variantOptions.find((o) => o.value === name)?.label ??
        constLabel ??
        name;

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
