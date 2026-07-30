import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { FIELDS_PAGE } from '../constants/pages/fields';

export const metadata = {
    title: 'Что система заполняет сама — каталог автоматизации',
    description: FIELDS_PAGE.description,
};

export default function FieldsPage() {
    return <HowContentPage page={FIELDS_PAGE} />;
}
