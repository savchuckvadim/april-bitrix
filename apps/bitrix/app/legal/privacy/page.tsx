import React from 'react';
import { LegalDocument } from '../components/LegalDocument';
import { PRIVACY_DOCUMENT } from './constants/privacy-document';

export const metadata = {
    title: 'Политика обработки персональных данных — приложение «Менеджер Гарант» для Битрикс24',
    description:
        'Политика обработки и защиты персональных данных приложения «Менеджер Гарант» для Битрикс24.',
};

export default function PrivacyPage() {
    return <LegalDocument document={PRIVACY_DOCUMENT} />;
}
