import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { ANALYTICS_PAGE } from '../constants/pages/analytics';

export const metadata = {
    title: 'Аналитика руководителя — KPI, которому можно верить',
    description: ANALYTICS_PAGE.description,
};

export default function AnalyticsPage() {
    return <HowContentPage page={ANALYTICS_PAGE} />;
}
