'use client';

import dynamic from 'next/dynamic';

/** react-pdf нельзя грузить на сервере — миниатюра только в браузере. */
export const OfferPdfStyleThumbLoadable = dynamic(
    () => import('./OfferPdfStyleThumb').then(m => m.OfferPdfStyleThumb),
    { ssr: false },
);
