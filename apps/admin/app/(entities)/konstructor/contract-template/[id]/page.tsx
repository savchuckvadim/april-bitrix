'use client';

import { use } from 'react';
import { ContractTemplateDetailsPageContent } from '@/modules/entities/konstructor/contract-template';

export default function ContractTemplateDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <ContractTemplateDetailsPageContent
            id={id}
            listPath="/konstructor/contract-template"
        />
    );
}
