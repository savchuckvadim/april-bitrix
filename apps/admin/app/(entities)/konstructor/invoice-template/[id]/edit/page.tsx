'use client';

import { use } from 'react';
import { InvoiceTemplateEditPageContent } from '@/modules/entities/konstructor/invoice-template';

export default function EditInvoiceTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <InvoiceTemplateEditPageContent
            id={id}
            listPath="/konstructor/invoice-template"
        />
    );
}
