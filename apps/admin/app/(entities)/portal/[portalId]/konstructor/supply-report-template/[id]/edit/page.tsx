'use client';

import { use } from 'react';
import { SupplyReportTemplateEditPageContent } from '@/modules/entities/konstructor/supply-report-template';

export default function EditPortalSupplyReportTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <SupplyReportTemplateEditPageContent
            id={id}
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/supply-report-template`}
        />
    );
}
