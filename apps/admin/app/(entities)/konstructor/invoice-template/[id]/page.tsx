'use client';

import { use } from 'react';
import { InvoiceTemplateDetailsPageContent } from '@/modules/entities/konstructor/invoice-template';

export default function InvoiceTemplateDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <InvoiceTemplateDetailsPageContent
            id={id}
            listPath="/konstructor/invoice-template"
        />
    );
}
