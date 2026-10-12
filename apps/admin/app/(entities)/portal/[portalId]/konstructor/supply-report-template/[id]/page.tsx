'use client';

import { use } from 'react';
import { SupplyReportTemplateDetailsPageContent } from '@/modules/entities/konstructor/supply-report-template';

export default function PortalSupplyReportTemplateDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <SupplyReportTemplateDetailsPageContent
            id={id}
            listPath={`/portal/${portalId}/konstructor/supply-report-template`}
        />
    );
}
