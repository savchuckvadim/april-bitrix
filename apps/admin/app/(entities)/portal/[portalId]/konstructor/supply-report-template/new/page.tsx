'use client';

import { use } from 'react';
import { SupplyReportTemplateCreatePageContent } from '@/modules/entities/konstructor/supply-report-template';

export default function NewPortalSupplyReportTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    return (
        <SupplyReportTemplateCreatePageContent
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/supply-report-template`}
        />
    );
}
