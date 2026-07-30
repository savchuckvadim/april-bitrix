import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { AI_PAGE } from '../constants/pages/ai';

export const metadata = {
    title: 'ИИ-анализ звонков — путь к CRM без кнопок',
    description: AI_PAGE.description,
};

export default function AiPage() {
    return <HowContentPage page={AI_PAGE} />;
}
