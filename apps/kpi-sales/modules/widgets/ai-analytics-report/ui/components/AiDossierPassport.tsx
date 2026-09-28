'use client';

import {
    AI_LEVEL,
    aiDossierSinceSourceLabel,
    aiDossierStatusLabel,
    formatAiFullDate,
    formatAiTenure,
    formatAiTenureBand,
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

/** Уровень не назначен или пришёл незнакомым кодом — нейтральная подпись. */
const LEVEL_EMPTY = 'не назначен';

/** Поля паспорта строками: стаж с источником даты, статус, уровень, группа стажа. */
export const aiDossierPassportFields = (
    passport: AiDossierPassportData,
): Field[] => {
    const sinceSource = aiDossierSinceSourceLabel(passport.sinceSource);
    const tenureBand = passport.tenureBand
        ? ` · ${formatAiTenureBand(passport.tenureBand)}`
        : '';
    return [
        {
            key: 'since',
            title: 'Работает с',
            value: passport.since
                ? formatAiFullDate(passport.since) +
                  (sinceSource ? ` (${sinceSource})` : '')
                : '—',
        },
        {
            key: 'tenure',
            title: 'Стаж',
            value:
                passport.tenureMonths === null
                    ? '—'
                    : `${formatAiTenure(passport.tenureMonths)}${tenureBand}`,
        },
        {
            key: 'status',
            title: 'Статус',
            value:
                aiDossierStatusLabel(passport.status) +
                (passport.leftAt
                    ? ` с ${formatAiFullDate(passport.leftAt)}`
                    : ''),
        },
        {
            key: 'level',
            title: 'Уровень',
            value: isLevel(passport.level)
                ? AI_LEVEL[passport.level].label
                : LEVEL_EMPTY,
        },
    ];
};

/** Паспорт менеджера: стаж и его источник, статус, уровень, группа стажа. */
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
