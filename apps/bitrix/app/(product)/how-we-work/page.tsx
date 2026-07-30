import React from 'react';
import { HowContentPage } from './components/HowContentPage';
import { OVERVIEW_PAGE } from './constants/pages/overview';

export const metadata = {
    title: 'Как мы работаем — автоматизация активных B2B-продаж в Битрикс24',
    description: OVERVIEW_PAGE.description,
};

export default function HowWeWorkPage() {
    return <HowContentPage page={OVERVIEW_PAGE} />;
}
