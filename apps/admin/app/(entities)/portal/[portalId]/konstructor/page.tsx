'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@workspace/ui/components/card';

const ENTITIES: { slug: string; title: string; description: string }[] = [
    {
        slug: 'contract',
        title: 'Договоры',
        description: 'Договоры портала: выбранные виды договоров и их единицы измерения.',
    },
    {
        slug: 'measure',
        title: 'Единицы измерения',
        description: 'Единицы измерения портала: синхронизация и сводка PortalDB ↔ Bitrix.',
    },
    {
        slug: 'template',
        title: 'Шаблоны',
        description: 'Шаблоны документов портала и управление их полями и счётчиками.',
    },
    {
        slug: 'field',
        title: 'Поля',
        description: 'Справочник полей конструктора для подстановки в шаблоны.',
    },
    {
        slug: 'counter',
        title: 'Счётчики',
        description: 'Справочник счётчиков для нумераторов и шаблонов.',
    },
    {
        slug: 'numerator',
        title: 'Нумераторы',
        description: 'Нумерация документов в разрезе реквизитов (Rq) портала.',
    },
];

export default function PortalKonstructorPage() {
    const params = useParams<{ portalId: string }>();
    const base = `/portal/${params.portalId}/konstructor`;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Конструктор портала</h1>
                <p className="text-sm text-muted-foreground">
                    Договоры и единицы измерения в контексте портала
                </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ENTITIES.map((entity) => (
                    <Link key={entity.slug} href={`${base}/${entity.slug}`}>
                        <Card className="h-full transition-colors hover:bg-accent">
                            <CardHeader>
                                <CardTitle>{entity.title}</CardTitle>
                                <CardDescription>{entity.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
