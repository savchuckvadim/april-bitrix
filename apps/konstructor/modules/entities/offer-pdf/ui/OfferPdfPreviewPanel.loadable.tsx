'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/** react-pdf нельзя грузить на сервере — панель только в браузере (как у Word-превью). */
export const OfferPdfPreviewPanelLoadable = dynamic(
    () => import('./OfferPdfPreviewPanel').then(m => m.OfferPdfPreviewPanel),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-[200px] items-center justify-center py-10">
                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Загрузка превью…</span>
            </div>
        ),
    },
);
