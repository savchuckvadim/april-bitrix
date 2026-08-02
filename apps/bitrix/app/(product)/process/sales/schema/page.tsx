import React from 'react';
import { SpineView } from '../components/SpineView';
import { SALES_PAGE_META } from '../constants/copy';

export const metadata = {
    title: 'Процесс продажи — карта-конфигуратор',
    description: SALES_PAGE_META.description,
};

export default function SalesProcessPage() {
    return <SpineView />;
}
