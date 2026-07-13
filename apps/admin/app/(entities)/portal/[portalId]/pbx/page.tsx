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
        slug: 'company',
        title: 'Компания',
        description: 'Поля Company: шаблон ↔ Bitrix ↔ PortalDB.',
    },
    {
        slug: 'deal',
        title: 'Сделка',
        description: 'Поля + воронки и стадии сделки.',
    },
    {
        slug: 'user',
        title: 'Пользователь',
        description: 'Пользовательские поля (из констант).',
    },
    {
        slug: 'task',
        title: 'Задача',
        description: 'Поля задач в Bitrix (из констант).',
    },
    {
        slug: 'departament',
        title: 'Отдел',
        description: 'Установка/правка отдела (ОП/ОС) в PortalDB.',
    },
    {
        slug: 'group',
        title: 'Группа звонков',
        description: 'Рабочая группа Bitrix (sonet_group).',
    },
    {
        slug: 'smart',
        title: 'Смарт-процессы',
        description: 'Смарт целиком + поля + воронки/стадии.',
    },
    {
        slug: 'rpa',
        title: 'RPA',
        description: 'RPA-процесс + поля + воронка/стадии.',
    },
    {
        slug: 'lead',
        title: 'Лид',
        description: 'Поля лида + сопоставление стадий с Bitrix.',
    },
    {
        slug: 'contact',
        title: 'Контакт',
        description: 'Поля Contact: шаблон ↔ Bitrix ↔ PortalDB.',
    },
    {
        slug: 'rq',
        title: 'Реквизиты',
        description: 'Пресеты (типы) + поля реквизита для договоров.',
    },
    {
        slug: 'list',
        title: 'Списки',
        description: 'Универсальные списки (KPI, история) + их поля.',
    },
];

export default function PbxPage() {
    const params = useParams<{ portalId: string }>();
    const base = `/portal/${params.portalId}/pbx`;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">PBX Install</h1>
                <p className="text-sm text-muted-foreground">
                    Установка и синхронизация конфигурации CRM
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