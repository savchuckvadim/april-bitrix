'use client';

import { use } from 'react';
import { SupplyReportTemplateEditPageContent } from '@/modules/entities/konstructor/supply-report-template';

export default function EditSupplyReportTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <SupplyReportTemplateEditPageContent
            id={id}
            listPath="/konstructor/supply-report-template"
        />
    );
}
