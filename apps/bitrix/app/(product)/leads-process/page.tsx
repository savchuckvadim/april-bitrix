import React from 'react';
import { LeadsProcessShell } from './components/LeadsProcessShell';
import { LEADS_PAGE_META } from './constants/content';

export const metadata = {
    title: 'Лиды: бизнес-процесс входящего потока — проектный стандарт',
    description: LEADS_PAGE_META.description,
};

export default function LeadsProcessPage() {
    return <LeadsProcessShell />;
}
