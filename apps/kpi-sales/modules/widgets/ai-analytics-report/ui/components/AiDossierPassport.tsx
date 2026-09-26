'use client';

import {
    AI_LEVEL,
    aiDossierSinceSourceLabel,
    aiDossierStatusLabel,
    formatAiTenure,
    type AiDossierPassport as AiDossierPassportData,
    type AiManagerLevel,
} from '@/modules/entities/ai-analytics';

interface AiDossierPassportProps {
    passport: AiDossierPassportData;
}

interface Field {
    key: string;
    title: string;
    value: string;
}

const isLevel = (value: string | null): value is AiManagerLevel =>
    value !== null && value in AI_LEVEL;

/** Дата YYYY-MM-DD → «07.09.2026»; иное — как пришло. */
const formatFullDate = (value: string): string => {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}.${year}` : value;
};

/** Поля паспорта строками: стаж с источником даты, статус, уровень, полоса стажа. */
export const aiDossierPassportFields = (
    passport: AiDossierPassportData,
): Field[] => [
    {
        key: 'since',
        title: 'Работает с',
        value: passport.since
            ? formatFullDate(passport.since) +
              (passport.sinceSource
                  ? ` (${aiDossierSinceSourceLabel(passport.sinceSource)})`
                  : '')
            : '—',
    },
    {
        key: 'tenure',
        title: 'Стаж',
        value:
            passport.tenureMonths === null
                ? '—'
                : `${formatAiTenure(passport.tenureMonths)}${passport.tenureBand ? ` · полоса ${passport.tenureBand}` : ''}`,
    },
    {
        key: 'status',
        title: 'Статус',
        value:
            aiDossierStatusLabel(passport.status) +
            (passport.leftAt ? ` с ${formatFullDate(passport.leftAt)}` : ''),
    },
    {
        key: 'level',
        title: 'Уровень',
        value: isLevel(passport.level)
            ? AI_LEVEL[passport.level].label
            : (passport.level ?? '—'),
    },
];

/** Паспорт менеджера: стаж и его источник, статус, уровень, полоса стажа. */
export const AiDossierPassport = ({ passport }: AiDossierPassportProps) => (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {aiDossierPassportFields(passport).map(field => (
            <div key={field.key}>
                <dt className="text-xs text-muted-foreground">{field.title}</dt>
                <dd className="font-medium">{field.value}</dd>
            </div>
        ))}
    </dl>
);
