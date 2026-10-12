'use client';

import { use } from 'react';
import { ContractTemplateCreatePageContent } from '@/modules/entities/konstructor/contract-template';

export default function NewPortalContractTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    return (
        <ContractTemplateCreatePageContent
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/contract-template`}
        />
    );
}
