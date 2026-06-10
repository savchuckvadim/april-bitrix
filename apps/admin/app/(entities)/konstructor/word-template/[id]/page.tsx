'use client';

import { use } from 'react';
import { WordTemplateDetailsPageContent } from '@/modules/entities/konstructor/word-template';

export default function WordTemplateDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <WordTemplateDetailsPageContent id={id} listPath="/konstructor/word-template" />;
}
