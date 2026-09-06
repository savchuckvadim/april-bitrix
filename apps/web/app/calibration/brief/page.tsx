import React from 'react';
import type { Metadata } from 'next';
import { BriefDocument } from '@/components/calibration/brief/BriefDocument';
import { CALIBRATION_BRIEF } from '@/lib/calibration/brief-content';

const BRIEF_DESCRIPTION =
    'Бриф на настройку AI-аналитики звонков: кто участвует, процесс продаж, типы звонков, определения, критерии оценки, чек-листы, материалы, эталонные звонки и согласия. Версия для печати.';

export const metadata: Metadata = {
    title: `${CALIBRATION_BRIEF.title} — версия для печати`,
    description: BRIEF_DESCRIPTION,
    openGraph: {
        type: 'article',
        locale: 'ru_RU',
        title: `${CALIBRATION_BRIEF.title} — версия для печати`,
        description: BRIEF_DESCRIPTION,
    },
};

export default function CalibrationBriefPage() {
    return (
        <div className="min-h-svh bg-background">
            <BriefDocument />
        </div>
    );
}
