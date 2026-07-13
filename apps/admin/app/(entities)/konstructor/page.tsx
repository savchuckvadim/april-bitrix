import Link from 'next/link';

export default function KonstructorPage() {
    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Настройки конструктора (общие)</h1>
            <div className="space-y-2">
                <Link className="text-primary underline" href="/konstructor/word-template">
                    Word templates
                </Link>
                <br />
                <Link className="text-primary underline" href="/konstructor/pdf-template">
                    PDF templates
                </Link>
                <br />
                <Link className="text-primary underline" href="/konstructor/contract">
                    Виды договоров
                </Link>
                <br />
                <Link className="text-primary underline" href="/konstructor/measure">
                    Единицы измерения
                </Link>
            </div>
        </div>
    );
}
