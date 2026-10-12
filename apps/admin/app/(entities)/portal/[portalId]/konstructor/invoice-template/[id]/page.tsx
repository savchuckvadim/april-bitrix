'use client';

import { use } from 'react';
import { InvoiceTemplateDetailsPageContent } from '@/modules/entities/konstructor/invoice-template';

export default function PortalInvoiceTemplateDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <InvoiceTemplateDetailsPageContent
            id={id}
            listPath={`/portal/${portalId}/konstructor/invoice-template`}
        />
    );
}
