import React from 'react';
import { LegalDocument } from '../components/LegalDocument';
import { SITE_PRIVACY_DOCUMENT } from './constants/site-privacy-document';

export const metadata = {
    title: 'Политика конфиденциальности сайта — bitrix.april-app.ru',
    description:
        'Политика обработки персональных данных посетителей сайта bitrix.april-app.ru, оставляющих заявку через формы сайта.',
};

export default function SitePrivacyPage() {
    return <LegalDocument document={SITE_PRIVACY_DOCUMENT} />;
}
