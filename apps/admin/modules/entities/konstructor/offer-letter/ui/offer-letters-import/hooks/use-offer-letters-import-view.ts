'use client';

import { useState } from 'react';
import { useOfferLettersImport } from '../../../lib/hooks';
import { offerLettersImportSummary } from '../../../lib/offer-letter-view';

/** Экран переноса: проверка, подтверждение записи, итог по ответу ручки */
export const useOfferLettersImportView = () => {
    const mutation = useOfferLettersImport();
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const check = () => mutation.mutate({ dryRun: true });
    const run = () =>
        mutation.mutate({ dryRun: false }, { onSettled: () => setConfirmOpen(false) });

    return {
        check,
        run,
        isConfirmOpen,
        setConfirmOpen,
        isPending: mutation.isPending,
        isError: mutation.isError,
        items: mutation.data?.items ?? [],
        summary: mutation.data ? offerLettersImportSummary(mutation.data) : null,
    };
};
