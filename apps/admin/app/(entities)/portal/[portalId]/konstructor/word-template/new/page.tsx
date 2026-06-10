'use client';

import { use } from 'react';
import { WordTemplateCreatePageContent } from '@/modules/entities/konstructor/word-template';

export default function NewPortalWordTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    return (
        <WordTemplateCreatePageContent
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/word-template`}
        />
    );
}
