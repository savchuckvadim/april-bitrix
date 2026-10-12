import { SupplyReportTemplateList } from '@/modules/entities/konstructor/supply-report-template';

export default async function PortalSupplyReportTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = await params;

    return (
        <SupplyReportTemplateList
            portalId={portalId}
            basePath={`/portal/${portalId}/konstructor/supply-report-template`}
        />
    );
}
