'use client';

import { use } from 'react';
import { ContractTemplateDetailsPageContent } from '@/modules/entities/konstructor/contract-template';

export default function PortalContractTemplateDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <ContractTemplateDetailsPageContent
            id={id}
            listPath={`/portal/${portalId}/konstructor/contract-template`}
        />
    );
}
