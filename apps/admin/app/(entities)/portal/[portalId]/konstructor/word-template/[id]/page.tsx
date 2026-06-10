'use client';

import { use } from 'react';
import { WordTemplateDetailsPageContent } from '@/modules/entities/konstructor/word-template';

export default function PortalWordTemplateDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <WordTemplateDetailsPageContent
            id={id}
            listPath={`/portal/${portalId}/konstructor/word-template`}
        />
    );
}
