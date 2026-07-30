import React from 'react';
import { LegalDocument } from '../components/LegalDocument';
import { LICENSE_PDF_PATH } from '../constants/vendor';
import { LICENSE_DOCUMENT } from './constants/license-document';

export const metadata = {
    title: 'Лицензионное соглашение — приложение «Менеджер Гарант» для Битрикс24',
    description:
        'Лицензионное соглашение на использование программы для ЭВМ — приложения «Менеджер Гарант» для Битрикс24.',
};

export default function LicensePage() {
    return (
        <LegalDocument
            document={LICENSE_DOCUMENT}
            pdf={{
                href: LICENSE_PDF_PATH,
                fileName: 'Менеджер Гарант — лицензионное соглашение.pdf',
            }}
        />
    );
}
