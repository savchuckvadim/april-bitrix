'use client';

import { useRouter } from 'next/navigation';
import { WordTemplateForm } from '../word-template-form/WordTemplateForm';
import { useCreateWordTemplate } from '../../lib/hooks';
import { ICreateWordTemplateDto } from '../../model';

interface WordTemplateCreatePageContentProps {
    listPath: string;
    portalId?: string;
}

export function WordTemplateCreatePageContent({
    listPath,
    portalId,
}: WordTemplateCreatePageContentProps) {
    const router = useRouter();
    const createWordTemplate = useCreateWordTemplate();

    const handleSubmit = (dto: ICreateWordTemplateDto) => {
        createWordTemplate.mutate(dto, {
            onSuccess: () => router.push(listPath),
        });
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <WordTemplateForm
                mode="create"
                portalId={portalId}
                onSubmit={handleSubmit}
                onCancel={() => router.push(listPath)}
                isLoading={createWordTemplate.isPending}
            />
        </div>
    );
}
