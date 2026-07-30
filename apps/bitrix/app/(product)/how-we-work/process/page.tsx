import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { PROCESS_PAGE } from '../constants/pages/process';

export const metadata = {
    title: 'Как устроена продажа — воронка и событийная модель',
    description: PROCESS_PAGE.description,
};

export default function ProcessPage() {
    return <HowContentPage page={PROCESS_PAGE} />;
}
