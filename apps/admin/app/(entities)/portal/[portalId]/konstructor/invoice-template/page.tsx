import { InvoiceTemplateList } from '@/modules/entities/konstructor/invoice-template';

export default async function PortalInvoiceTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = await params;

    return (
        <InvoiceTemplateList
            portalId={portalId}
            basePath={`/portal/${portalId}/konstructor/invoice-template`}
        />
    );
}
