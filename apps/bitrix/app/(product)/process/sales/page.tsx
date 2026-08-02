import React from 'react';
import { OverviewView } from './overview/components/OverviewView';
import { SALES_OVERVIEW } from './overview/constants/overview';

export const metadata = {
    title: 'Процесс продажи — о документе',
    description: SALES_OVERVIEW.description,
};

export default function SalesOverviewPage() {
    return <OverviewView />;
}
