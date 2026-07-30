import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { PHILOSOPHY_PAGE } from '../constants/pages/philosophy';

export const metadata = {
    title: 'Наш подход — принципы автоматизации продаж',
    description: PHILOSOPHY_PAGE.description,
};

export default function PhilosophyPage() {
    return <HowContentPage page={PHILOSOPHY_PAGE} />;
}
