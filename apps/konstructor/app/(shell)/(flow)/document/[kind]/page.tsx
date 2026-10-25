import { notFound } from 'next/navigation';
import { DOCUMENT_KINDS, isDocumentKind } from '@/modules/shared/lib/routing';
import { DocumentScreen } from '@/modules/widgets/document-screen';

export function generateStaticParams() {
    return DOCUMENT_KINDS.map(({ kind }) => ({ kind }));
}

export default async function DocumentKindPage({
    params,
}: {
    params: Promise<{ kind: string }>;
}) {
    const { kind } = await params;
    if (!isDocumentKind(kind)) notFound();
    return <DocumentScreen kind={kind} />;
}
