'use client'
import React from 'react';

export const PrintStyles: React.FC = () => {
    return (
        <style jsx global>{`
            @media print {
                header,
                footer,
                button,
                .no-print {
                    display: none !important;
                }
                body {
                    background: white;
                }
                .print-page {
                    page-break-after: always;
                }
                main {
                    padding: 0 !important;
                }
            }
        `}</style>
    );
};

