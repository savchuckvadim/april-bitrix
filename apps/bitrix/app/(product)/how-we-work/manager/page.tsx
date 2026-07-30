import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { MANAGER_PAGE } from '../constants/pages/manager';

export const metadata = {
    title: 'Рабочее место менеджера — одна форма вместо ведения CRM',
    description: MANAGER_PAGE.description,
};

export default function ManagerPage() {
    return <HowContentPage page={MANAGER_PAGE} />;
}
