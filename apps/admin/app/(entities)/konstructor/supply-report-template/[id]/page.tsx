'use client';

import { use } from 'react';
import { SupplyReportTemplateDetailsPageContent } from '@/modules/entities/konstructor/supply-report-template';

export default function SupplyReportTemplateDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <SupplyReportTemplateDetailsPageContent
            id={id}
            listPath="/konstructor/supply-report-template"
        />
    );
}
