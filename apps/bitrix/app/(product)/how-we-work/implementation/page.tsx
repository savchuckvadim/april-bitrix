import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { IMPLEMENTATION_PAGE } from '../constants/pages/implementation';

export const metadata = {
    title: 'Внедрение — настройка под вашу компанию и анкеты',
    description: IMPLEMENTATION_PAGE.description,
};

export default function ImplementationPage() {
    return <HowContentPage page={IMPLEMENTATION_PAGE} />;
}
