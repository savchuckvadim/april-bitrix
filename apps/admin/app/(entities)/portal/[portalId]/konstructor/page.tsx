import Link from 'next/link';

export default async function KonstructorPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = await params;

    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Настройки конструктора портала</h1>
            <div className="space-y-2">
                <Link
                    className="text-primary underline"
                    href={`/portal/${portalId}/konstructor/word-template`}
                >
                    Word templates (portal)
                </Link>
                <br />
                <Link
                    className="text-primary underline"
                    href={`/portal/${portalId}/konstructor/pdf-template`}
                >
                    PDF templates (portal)
                </Link>
            </div>
        </div>
    );
}
