import { ContractTemplateList } from '@/modules/entities/konstructor/contract-template';

export default async function PortalContractTemplatePage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = await params;

    return (
        <ContractTemplateList
            portalId={portalId}
            basePath={`/portal/${portalId}/konstructor/contract-template`}
        />
    );
}
