'use client';

import { use } from 'react';
import { WordTemplateEditPageContent } from '@/modules/entities/konstructor/word-template';

export default function EditWordTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <WordTemplateEditPageContent id={id} listPath="/konstructor/word-template" />;
}
