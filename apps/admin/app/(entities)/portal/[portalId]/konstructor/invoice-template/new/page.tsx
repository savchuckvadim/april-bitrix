'use client';

import { use } from 'react';
import { InvoiceTemplateCreatePageContent } from '@/modules/entities/konstructor/invoice-template';

export default function NewPortalInvoiceTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    return (
        <InvoiceTemplateCreatePageContent
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/invoice-template`}
        />
    );
}
