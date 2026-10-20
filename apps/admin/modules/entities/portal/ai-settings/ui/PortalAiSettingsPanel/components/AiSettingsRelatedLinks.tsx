'use client';

import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { GuideLinkButton } from '@/modules/entities/ai-analytics-guide';

interface AiSettingsRelatedLinksProps {
    portalId: number;
}

interface RelatedLink {
    title: string;
    href: string;
    note: string;
}

/** Ссылки «что ещё посмотреть» для настроек конвейера портала. */
const buildLinks = (portalId: number): RelatedLink[] => [
    {
        title: 'Настройки kpiSales: включение и рассылки',
        href: `/portal/${portalId}/app-settings#group-ai_analytics_main`,
        note: 'Второй рубильник — витрина и рассылки поверх разборов: ai_analytics_enabled, алерты, дайджесты, получатели.',
    },
    {
        title: 'Настройки kpiSales: сотрудники и цели',
        href: `/portal/${portalId}/app-settings#group-ai_analytics_people`,
        note: 'Пилот allowedUserIds задаёт периметр разбора; уровни, цели и отсутствия — здесь.',
    },
    {
        title: 'Настройки kpiSales: модель и данные',
        href: `/portal/${portalId}/app-settings#group-ai_analytics_model`,
        note: 'Пороги сигналов, цена модели llm_price_per_1k, определения — в ai_analytics_model_params и соседних ключах.',
    },
    {
        title: 'База знаний портала',
        href: `/portal/${portalId}/ai-settings?tab=knowledge`,
        note: 'Инструкции разбора по типам (call-analysis-*), классификатор, скрипт, регламент, факты о продукте, свои мероприятия.',
    },
    {
        title: 'Смарт «AI-анализ звонков»',
        href: `/portal/${portalId}/pbx/smart`,
        note: 'Установка и долив значений перечислений после выкладок (door_closed, event_invite).',
    },
    {
        title: 'Разборы звонков портала',
        href: `/portal/${portalId}/statistics/ai`,
        note: 'Что именно модель написала по звонкам — проверить результат настроек.',
    },
];

/**
 * Блок «Как связано» на странице настроек AI портала: конвейер — первый
 * рубильник цепочки, ниже по ней — витрина и рассылки kpiSales, модель,
 * база знаний и смарт. Теория — в путеводителе (раздел «Разбор звонков»).
 */
export const AiSettingsRelatedLinks = ({ portalId }: AiSettingsRelatedLinksProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                Как связано
                <GuideLinkButton section="call-analysis" portalId={portalId} />
            </CardTitle>
            <CardDescription>
                Настройки конвейера влияют на всё, что ниже по цепочке: разборы →
                витрина и рассылки kpiSales → модель. Где смотреть и что ещё настроить:
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {buildLinks(portalId).map(link => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-primary underline underline-offset-2 hover:opacity-80"
                        >
                            {link.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{link.note}</p>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);
