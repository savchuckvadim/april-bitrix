'use client';

import { use } from 'react';
import { ContractTemplateEditPageContent } from '@/modules/entities/konstructor/contract-template';

export default function EditPortalContractTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <ContractTemplateEditPageContent
            id={id}
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/contract-template`}
        />
    );
}
