'use client';

import { use } from 'react';
import { ContractTemplateEditPageContent } from '@/modules/entities/konstructor/contract-template';

export default function EditContractTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <ContractTemplateEditPageContent
            id={id}
            listPath="/konstructor/contract-template"
        />
    );
}
