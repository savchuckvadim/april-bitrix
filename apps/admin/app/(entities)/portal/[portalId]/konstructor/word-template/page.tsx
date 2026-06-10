import { WordTemplateList } from '@/modules/entities/konstructor/word-template';

export default async function PortalWordTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = await params;

    return (
        <WordTemplateList
            portalId={portalId}
            basePath={`/portal/${portalId}/konstructor/word-template`}
        />
    );
}
