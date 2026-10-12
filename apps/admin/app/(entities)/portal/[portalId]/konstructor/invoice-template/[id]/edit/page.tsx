'use client';

import { use } from 'react';
import { InvoiceTemplateEditPageContent } from '@/modules/entities/konstructor/invoice-template';

export default function EditPortalInvoiceTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <InvoiceTemplateEditPageContent
            id={id}
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/invoice-template`}
        />
    );
}
