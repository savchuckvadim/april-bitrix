'use client';

import { use } from 'react';
import { WordTemplateEditPageContent } from '@/modules/entities/konstructor/word-template';

export default function EditPortalWordTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    return (
        <WordTemplateEditPageContent
            id={id}
            portalId={portalId}
            listPath={`/portal/${portalId}/konstructor/word-template`}
        />
    );
}
