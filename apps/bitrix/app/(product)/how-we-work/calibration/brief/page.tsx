import React from 'react';
import { CalibrationBriefDocument } from './components/CalibrationBriefDocument';
import { CALIBRATION_BRIEF } from './constants/brief-document';

export const metadata = {
    title: `${CALIBRATION_BRIEF.title} — версия для печати`,
    description:
        'Бриф на настройку AI-аналитики звонков: кто участвует, процесс продаж, типы звонков, определения, критерии оценки, чек-листы, материалы, эталонные звонки и согласия. Версия для печати.',
};

export default function CalibrationBriefPage() {
    return <CalibrationBriefDocument />;
}
