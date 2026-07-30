'use client';
import React from 'react';

/**
 * Стили печати юридических страниц: при печати (в том числе при сохранении в PDF)
 * скрывается всё, кроме области самого документа.
 */
export const LegalPrintStyles: React.FC = () => {
    return (
        <style jsx global>{`
            @media print {
                header,
                footer,
                nav,
                button,
                .no-print {
                    display: none !important;
                }
                body {
                    background: white !important;
                    color: black !important;
                }
                main {
                    padding: 0 !important;
                }
                .legal-document {
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .legal-document h1,
                .legal-document h2 {
                    break-after: avoid;
                    page-break-after: avoid;
                    color: black !important;
                }
                .legal-document p {
                    break-inside: avoid;
                    page-break-inside: avoid;
                    color: black !important;
                }
                .legal-document a {
                    color: black !important;
                    text-decoration: underline;
                }
            }

            @page {
                margin: 15mm;
            }
        `}</style>
    );
};
